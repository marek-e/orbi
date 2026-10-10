#!/usr/bin/env bun
import * as readline from "node:readline/promises";
import { Agent, type AgentEvent, type Effort } from "./agent.ts";

// Orbi's moods, from the mascot sheet. Phase 5 turns these into a real status line.
const FACE = {
  idle: "(◕‿◕)",
  analyzing: "(⊙_⊙)",
  celebrating: "(^‿^)",
  alert: "(°o°)!",
};

const color = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return (text: string) => `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
};
const gold = color("#DFAA66");
const purple = color("#9C7FE0");
const red = color("#E5737A");
const dim = (text: string) => `\x1b[2m${text}\x1b[0m`;

const yolo = process.argv.includes("--yolo");
const model = process.env.ORBI_MODEL ?? "claude-opus-5-5";
const effort = (process.env.ORBI_EFFORT ?? "high") as Effort;

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
// Phase 4 makes Ctrl-C cancel the current turn. For now it quits.
rl.on("SIGINT", () => process.exit(130));
rl.on("close", () => process.exit(0));

const agent = new Agent({
  model,
  effort,
  cwd: process.cwd(),
  approve: async () => {
    if (yolo) return true;
    const answer = await rl.question(gold(`${FACE.alert} run it? [y/N] `));
    return answer.trim().toLowerCase() === "y";
  },
});

// Remembers what was printed last, to put line breaks between thinking,
// text and tool output without blank lines everywhere.
let last: AgentEvent["type"] | null = null;

function render(event: AgentEvent) {
  if (event.type !== last && (last === "thinking" || last === "text")) process.stdout.write("\n");
  switch (event.type) {
    case "thinking":
      process.stdout.write(dim(event.delta));
      break;
    case "text":
      process.stdout.write(event.delta);
      break;
    case "tool_call":
      console.log(purple(`${FACE.analyzing} $ ${event.command}`));
      break;
    case "tool_result": {
      const lines = event.output.split("\n");
      const preview = lines.slice(0, 8).join("\n");
      const more = lines.length > 8 ? `\n… ${lines.length - 8} more lines` : "";
      console.log((event.isError ? red : dim)(preview + more));
      break;
    }
    case "notice":
      console.log(gold(`${FACE.alert} ${event.message}`));
      break;
    case "turn_end": {
      const { inputTokens, outputTokens, cacheReadTokens, requests } = event.usage;
      const k = (n: number) => `${(n / 1000).toFixed(1)}k`;
      console.log(
        "\n" +
          gold(FACE.celebrating) +
          dim(
            ` ${requests} requests · ${k(inputTokens)} in · ${k(cacheReadTokens)} cached · ${k(outputTokens)} out`,
          ),
      );
      break;
    }
  }
  last = event.type;
}

console.log(
  gold(`${FACE.idle} orbi`) +
    dim(` · ${model} · effort ${effort}${yolo ? " · yolo" : ""} · /exit to quit`),
);

while (true) {
  const input = (await rl.question(`\n${purple("›")} `)).trim();
  if (!input) continue;
  if (input === "/exit" || input === "/quit") break;

  last = null;
  try {
    for await (const event of agent.prompt(input)) render(event);
  } catch (err) {
    console.error(red(`\n${FACE.alert} ${err instanceof Error ? err.message : String(err)}`));
  }
}
rl.close();
