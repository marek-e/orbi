# Model access: subscriptions vs API keys

Researched 2026-10-09. These policies changed several times in 2026, so check the sources again before relying on this note.

## Claude (Anthropic)

**Using a Pro/Max subscription from my own agent loop is not allowed.** Anthropic's legal page for Claude Code says subscription OAuth is "designed to support ordinary use of Claude Code and other native Anthropic applications", and that developers "may not collect, store, or intermediate Claude.ai credentials or session tokens". It reserves the right to enforce "without prior notice". Source: [Claude Code legal and compliance](https://code.claude.com/docs/en/legal-and-compliance).

It has been enforced:
- OpenCode removed its Claude Pro/Max login on 2026-03-19, citing "anthropic legal requests" ([PR #18186](https://github.com/anomalyco/opencode/pull/18186)).
- Pi still has the login flow. Since April, requests through it fail with "Third-party apps now draw from your extra usage, not your plan limits" ([issue #3372](https://github.com/earendil-works/pi/issues/3372)).
- The Register covered the clarified terms on [2026-02-20](https://www.theregister.com/2026/02/20/anthropic_clarifies_ban_third_party_claude_access/).

**What is allowed with a subscription:** driving the unmodified Claude Code binary, through `claude -p` or the Agent SDK. Anthropic's support article ([Use the Claude Agent SDK with your Claude plan](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan), updated 2026-10-07) says: "You can still use the Claude Agent SDK, `claude -p`, and third-party apps with your subscription limits." It also says Max and Team plans now include monthly API credits. I haven't confirmed the amounts or whether Pro gets any.

Caveats:
- The [headless docs](https://code.claude.com/docs/en/headless) say `--bare` mode ignores the subscription login and "will become the default for `-p` in a future release".
- With `claude -p`, Claude Code runs its own loop, and Orbi only sees the results.

**`ant auth login`** logs in to the Claude Console. That account is billed at API rates, not against the subscription.

## ChatGPT (OpenAI)

**Using a ChatGPT subscription from my own agent is allowed.** OpenAI launched "Sign in with ChatGPT" on 2026-09-29 ([docs](https://developers.openai.com/siwc), [walkthrough](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt)). Plan usage "is available to open-source projects, personal projects that run locally, and selected private apps". The user sets a weekly cap per app, and the app must show "Using ChatGPT plan".

How it works:
- OAuth with PKCE and dynamic client registration (no client secret, no API key).
- Requests go to the public Responses API with the access token.
- Pi implements it in [`openai-chatgpt.ts`](https://github.com/earendil-works/pi/blob/main/packages/ai/src/auth/oauth/openai-chatgpt.ts).
- The older method reused the Codex CLI's OAuth client and called `chatgpt.com/backend-api`. It was never officially sanctioned, and Pi now labels it "legacy".

## Other models

Pi's [`ai` package](https://github.com/earendil-works/pi/blob/main/packages/ai/README.md) supports:
- OpenRouter, with an API key.
- Local models through any OpenAI-compatible server (Ollama, LM Studio, vLLM).
- GitHub Copilot, through OAuth.
- Gemini, with an API key or Vertex.

## Checked on 2026-10-10

**Max plan API credits.** Max 5x includes $100 a month and Max 20x $200, delivered to a linked Claude Console organization ([docs](https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers)). Every API key in that organization draws from them, so an Anthropic API key in Orbi's own loop would spend them. They don't roll over, and don't cover Claude Code itself.

**Sign in with ChatGPT request rules** ([preview limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations), [models and inference](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference)):
- Every request sets `store: false` and `stream: true`, so the full history is replayed each time.
- No `previous_response_id`, `background`, `temperature`, `top_p`, `max_output_tokens`, `truncation` or `metadata`.
- No system-role items, and no hosted tools (file search, code interpreter, image generation, hosted MCP).
- Models come from `GET /v1/models` for the signed-in account, not a fixed list.
- Requests go to `POST https://api.openai.com/v1/responses` with the OAuth token.

**Reasoning replay.** In stateless mode, encrypted reasoning comes back by default and is reusable only within the same model family ([guide](https://developers.openai.com/api/docs/guides/reasoning)).

## Not confirmed

- The exact launch date of Sign in with ChatGPT (2026-09-29 comes from a search summary, not an OpenAI page).
