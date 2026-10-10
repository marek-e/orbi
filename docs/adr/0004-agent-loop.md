# ADR-0004: Who writes the agent loop?

| | |
|---|---|
| **Status** | Accepted · 2026-10-09 (converted to this format on 2026-10-10) |
| **Owner** | Marek Elmayan |
| **Supersedes** | – |
| **Superseded by** | – |
| **Related** | [ADR-0006](0006-model-access.md) (model access), [ADR-0007](0007-message-format.md) (message format), roadmap Phase 1 |

## Context

At its center, a coding agent is a loop: send the conversation to the model, run the tools it asks for, send the results back, and repeat until it answers without asking for a tool. Around that loop sit retries, streaming, caching, compaction and approval.

Several libraries and products already run this loop, at different levels: from a helper inside a provider SDK to a complete agent that can be embedded. Phase 1 builds the loop, so who writes it has to be settled first. Everything in later phases (tools, sessions, sbires, evals) plugs into it.

## Criteria

| # | Criterion | Why it matters for Orbi |
|---|---|---|
| 1 | The code shows how the loop works | Goal 1 is understanding agents, and the vision's principle is "I own the loop and the protocol" |
| 2 | Control over every request: what's sent, caching, compaction, retries, logging | A daily driver that fits me means changing any behavior the day it annoys me, and every request must be loggable |
| 3 | Works with Sign in with ChatGPT now, and other providers later | [ADR-0006](0006-model-access.md) makes the ChatGPT subscription the primary access, and [ADR-0007](0007-message-format.md) keeps other providers possible |
| 4 | Time to a usable daily driver | Goal 2. Orbi should take over real work by Phase 3 or 4, not after a year |

Numbered by priority, 1 first.

## Options

### A hand-written loop on the provider's API

Orbi sends requests itself (through the provider's SDK for HTTP and types, or plain `fetch`) and writes the loop, tool execution and retries. What's in place today: the pre-decision draft does this against Anthropic's API.

### A provider SDK's agent runner

The provider's own helper runs the loop over tools Orbi defines: the OpenAI Agents SDK, or the Anthropic SDK's Tool Runner.

### A multi-provider framework

The Vercel AI SDK runs multi-step tool calls over one interface for many providers.

### A complete agent used as a library

The Claude Agent SDK or the Codex SDK runs Claude Code or Codex as a subprocess. Orbi supplies a UI and settings, the embedded agent does the rest.

### A fork of an open agent

Start from Pi's source (MIT) and change it, instead of starting from an empty file.

## Evaluation

| Option | 1. Shows how the loop works | 2. Control over every request | 3. Sign in with ChatGPT, then other providers | 4. Time to a daily driver |
|---|---|---|---|---|
| **Hand-written loop** | 🟢🟢🟢<br>- Every step of the loop is Orbi's own code | 🟢🟢🟢<br>- Orbi builds every request, so it can follow the [Sign in with ChatGPT rules](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations) (`store: false`, `stream: true`, no `temperature`) and log every byte | 🟢🟢<br>- Works with any API Orbi can call<br>- One adapter to write per provider ([ADR-0007](0007-message-format.md)) | 🟢<br>- The loop itself is short, but retries, streaming and tool execution are mine to write<br>- Phase 1 takes longer |
| **Provider SDK's runner** | 🟠<br>- [`run()`](https://raw.githubusercontent.com/openai/openai-agents-js/main/docs/src/content/docs/guides/models.mdx) or [`toolRunner`](https://github.com/anthropics/anthropic-sdk-typescript/blob/main/helpers.md) runs the loop. Orbi only defines tools and reads results | 🟢<br>- Options and hooks, but the library builds the request<br>- Whether the OpenAI Agents SDK's requests respect the Sign in with ChatGPT rules is unconfirmed | 🟠<br>- The OpenAI Agents SDK accepts a custom client, so a ChatGPT token can be plugged in<br>- Each runner covers one provider. Anthropic's is beta | 🟢🟢<br>- Loop, tool calls and retries come ready |
| **Multi-provider framework** | 🟠<br>- [`ToolLoopAgent` and `stopWhen`](https://ai-sdk.dev/docs/agents/loop-control) run the loop, and translation to each API happens inside the SDK<br>- The [vision](../vision.md) lists it as a non-goal | 🟢<br>- [`providerOptions`](https://ai-sdk.dev/providers/ai-sdk-providers/openai) reach `store` and `include`, and a custom `fetch` can log requests<br>- The SDK still builds them | 🟢🟢🟢<br>- `createOpenAI` takes custom headers or `fetch`, so a ChatGPT token works<br>- Many providers built in | 🟢🟢<br>- A working loop in a few lines |
| **Agent as a library** | 🔴<br>- The loop runs inside Claude Code or Codex. Orbi only sees its events | 🔴<br>- The embedded agent decides the prompt, caching and compaction | 🟠<br>- The Claude Agent SDK uses the Claude subscription legally<br>- The [Codex SDK](https://raw.githubusercontent.com/openai/codex/main/sdk/typescript/README.md) spawns the Codex CLI. Whether it works with a ChatGPT sign-in is unconfirmed<br>- One vendor each | 🟢🟢🟢<br>- A daily driver from day one |
| **Fork of Pi** | 🟢<br>- The loop is in readable code, but someone else wrote it. I'd learn by reading, not by building | 🟢🟢🟢<br>- The full source, [MIT](https://github.com/earendil-works/pi) | 🟢🟢🟢<br>- `pi-ai` already supports many providers and [Sign in with ChatGPT](https://github.com/earendil-works/pi/blob/main/packages/ai/src/auth/oauth/openai-chatgpt.ts) | 🟢🟢🟢<br>- A working agent from day one |

Scale: 🟢🟢🟢 strong · 🟢🟢 good · 🟢 acceptable · 🟠 weak · 🔴 fails. Sources checked on 2026-10-10.

## Decision

A hand-written loop on the provider's API.

- Criterion 1 decides it: the loop is what I'm here to understand, and only writing it myself scores full marks there.
- Forking Pi is the close second, better on time and providers. It loses on the one criterion that matters most, so Pi stays what I read next to my own code, not the base I start from.
- Agent libraries fail on control. The Claude Agent SDK comes back in Phase 8 as a second engine, not as the loop.

Trade-off accepted: Phase 1 takes longer, and every provider needs its own adapter.

## Consequences

- Orbi calls the provider's API itself, through the official SDK or plain `fetch`, and writes the loop, streaming, retries and tool execution.
- Phase 1 has to follow the Sign in with ChatGPT request rules directly: `store: false`, `stream: true`, and the history replayed in full on each request.
- Pi's source is the reference to compare with at each phase, which also gives the articles a point of comparison.

## Revisit if

- Keeping the loop up starts crowding out the learning once its parts are understood (after Phase 4 or so). Then taking `pi-agent-core` or a similar package becomes reasonable.
- A provider changes its API faster than one person can follow.
