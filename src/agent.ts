import Anthropic from "@anthropic-ai/sdk";
import { systemPrompt } from "./prompt.ts";
import { bashTool, runBash } from "./tools/bash.ts";

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export interface AgentOptions {
  model: string;
  effort: Effort;
  cwd: string;
  /** Asked before every command. Return false to refuse it. */
  approve: (command: string) => Promise<boolean>;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  requests: number;
}

// The agent never prints anything. It yields events, and whatever UI is
// attached (the REPL today, a TUI or an eval runner later) decides how to show them.
export type AgentEvent =
  | { type: "thinking"; delta: string }
  | { type: "text"; delta: string }
  | { type: "tool_call"; id: string; command: string }
  | { type: "tool_result"; id: string; output: string; isError: boolean }
  | { type: "notice"; message: string }
  | { type: "turn_end"; stopReason: string | null; usage: Usage };

const MAX_TOKENS = 64_000;
const MAX_JSON_RETRIES = 2;

export class Agent {
  private client = new Anthropic();
  private messages: Anthropic.Beta.BetaMessageParam[] = [];

  constructor(private options: AgentOptions) {}

  async *prompt(text: string): AsyncGenerator<AgentEvent> {
    const usage: Usage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, requests: 0 };
    let jsonRetries = 0;

    this.messages.push({ role: "user", content: text });

    // The whole agent: call the model, run the tools it asked for, send the
    // results back, repeat until it answers without asking for a tool.
    while (true) {
      const stream = this.client.beta.messages.stream({
        model: this.options.model,
        max_tokens: MAX_TOKENS,
        system: systemPrompt(this.options.cwd),
        tools: [bashTool],
        messages: this.messages,
        thinking: { type: "adaptive", display: "summarized" },
        output_config: { effort: this.options.effort },
        // If a safety classifier declines the request, the API retries it on
        // another model inside the same call instead of returning the refusal.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });

      let message: Anthropic.Beta.BetaMessage;
      try {
        for await (const event of stream) {
          if (event.type !== "content_block_delta") continue;
          if (event.delta.type === "thinking_delta") yield { type: "thinking", delta: event.delta.thinking };
          if (event.delta.type === "text_delta") yield { type: "text", delta: event.delta.text };
        }
        message = await stream.finalMessage();
        jsonRetries = 0;
      } catch (err) {
        // With eager input streaming the API no longer validates tool input,
        // so the SDK can fail to parse it. Only that case is retried.
        if (err instanceof Anthropic.APIError || jsonRetries++ >= MAX_JSON_RETRIES) throw err;
        yield { type: "notice", message: "tool input was not valid JSON, asking again" };
        continue;
      }

      usage.requests++;
      usage.inputTokens += message.usage.input_tokens;
      usage.outputTokens += message.usage.output_tokens;
      usage.cacheReadTokens += message.usage.cache_read_input_tokens ?? 0;
      if (message.model !== this.options.model) {
        yield { type: "notice", message: `answered by fallback model ${message.model}` };
      }

      // A refusal can stop in the middle of a tool call, and max_tokens can cut
      // a tool input short while it still parses. Running either would execute
      // a command the model never finished writing, so we keep neither turn.
      if (message.stop_reason === "refusal" || message.stop_reason === "max_tokens") {
        yield { type: "notice", message: `stopped: ${message.stop_reason}` };
        yield { type: "turn_end", stopReason: message.stop_reason, usage };
        return;
      }

      // Append the full content, thinking blocks included. The history is
      // append-only: the API rejects thinking blocks from an edited history.
      this.messages.push({ role: "assistant", content: message.content });

      const toolCalls = message.content.filter(
        (block): block is Anthropic.Beta.BetaToolUseBlock => block.type === "tool_use",
      );
      if (toolCalls.length === 0) {
        yield { type: "turn_end", stopReason: message.stop_reason, usage };
        return;
      }

      // All results go back in a single user message, one tool_result per tool_use.
      const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
      for (const call of toolCalls) {
        const command = parseCommand(call);
        if (command === null) {
          results.push({
            type: "tool_result",
            tool_use_id: call.id,
            is_error: true,
            content: `Invalid input for ${call.name}: ${JSON.stringify(call.input)}. Expected {"command": string}.`,
          });
          continue;
        }

        yield { type: "tool_call", id: call.id, command };
        const approved = await this.options.approve(command);
        const result = approved
          ? await runBash(command, this.options.cwd)
          : { output: "The user declined to run this command.", isError: true };
        yield { type: "tool_result", id: call.id, ...result };
        results.push({ type: "tool_result", tool_use_id: call.id, content: result.output, is_error: result.isError });
      }
      this.messages.push({ role: "user", content: results });
    }
  }
}

function parseCommand(call: Anthropic.Beta.BetaToolUseBlock): string | null {
  if (call.name !== bashTool.name) return null;
  const input = call.input as { command?: unknown } | null;
  return typeof input?.command === "string" && input.command.trim() !== "" ? input.command : null;
}
