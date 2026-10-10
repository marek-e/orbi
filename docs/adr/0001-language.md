# ADR-0001: Which language is Orbi written in?

| | |
|---|---|
| **Status** | Accepted · 2026-10-09 (converted to this format on 2026-10-10) |
| **Owner** | Marek Elmayan |
| **Supersedes** | – |
| **Superseded by** | – |
| **Related** | [ADR-0002](0002-runtime.md) (runtime), [vision](../vision.md) |

## Context

Orbi is a coding agent I build for three reasons: to understand how coding agents work, to use it every day, and to write an article series about it. One person writes it, in spare time.

It spends almost all its time waiting on the model API or on the commands it runs. Later phases add a command sandbox (Phase 4), a terminal UI (Phase 5) and an MCP client (Phase 6).

The language decides where my attention goes while I build, which libraries and reference agents I can lean on, and how easily article readers follow the code. Every line written after it depends on it, so it's the first decision.

## Criteria

| # | Criterion | Why it matters for Orbi |
|---|---|---|
| 1 | My attention stays on the agent, not on the language | Understanding agents is goal 1. Learning a language at the same time splits attention between the two |
| 2 | Libraries for what Orbi needs (provider SDKs, MCP, a terminal UI), and reference agents I can read in that language | Each missing library is something to write before getting to the agent. Reading how others solved a problem is half of the learning |
| 3 | Article readers can follow the code | The articles quote the code, and the repo is public so readers can clone a phase and read it |
| 4 | Direct access to OS sandboxing | Phase 4 runs model-written commands under a sandbox. How close the language is to the OS APIs decides how much of it I can write myself |
| 5 | Distribution and footprint (a single binary, memory) | Matters only if Orbi gets popular. For me and readers who clone, it's a convenience |

Numbered by priority, 1 first. Raw speed is left out on purpose: the time goes to the network and to subprocesses.

## Options

### TypeScript

The language I use every day. What's in place today: the pre-decision draft in `src/` is TypeScript.

### Rust

Compiles to a small static binary with low memory use and direct access to OS APIs. I'd be learning it while building.

### Go

Compiles to a single binary, has a simple concurrency model and a strong terminal UI ecosystem. I'd be learning it while building.

### Python

The language of most machine learning tooling and of several early coding agents. I can read it, but don't use it daily.

## Evaluation

| Option | 1. Attention on the agent | 2. Libraries and reference agents | 3. Readers follow the code | 4. OS sandboxing | 5. Distribution and footprint |
|---|---|---|---|---|---|
| **TypeScript** | 🟢🟢🟢<br>- I use it every day: no time goes to the language | 🟢🟢🟢<br>- Official [OpenAI SDK](https://developers.openai.com/api/docs/libraries) and [MCP SDK](https://github.com/modelcontextprotocol)<br>- Terminal UIs: Ink, OpenTUI, Pi's `pi-tui`<br>- Claude Code, [Pi](https://github.com/earendil-works/pi) and [OpenCode](https://github.com/anomalyco/opencode/blob/dev/packages/opencode/package.json) are all TypeScript | 🟢🟢🟢<br>- The language of the agents readers already compare with<br>- Types document the message and event shapes the articles talk about | 🟢🟢<br>- No direct system calls, but sandboxing goes through OS tools anyway: `sandbox-exec` on macOS, bubblewrap on Linux<br>- Anthropic's [sandbox-runtime](https://github.com/anthropic-experimental/sandbox-runtime) does exactly this in TypeScript, with a small C helper for seccomp | 🟢<br>- Needs a runtime, or a compiled binary of about 64 MB ([ADR-0002](0002-runtime.md))<br>- Higher memory use than a native binary |
| **Rust** | 🟠<br>- Ownership and async Rust while learning agents: the language becomes a second project | 🟢🟢<br>- Official [MCP SDK](https://github.com/modelcontextprotocol), Ratatui<br>- No official OpenAI SDK, only community crates ([list](https://developers.openai.com/api/docs/libraries))<br>- Codex is the reference agent, and the best one for sandboxing | 🟠<br>- Fewer readers read Rust fluently<br>- Lifetimes and async noise around a loop that is simple in itself | 🟢🟢🟢<br>- Codex builds [Seatbelt profiles](https://github.com/openai/codex/blob/main/codex-rs/sandboxing/src/seatbelt.rs) and runs [bubblewrap plus seccomp](https://github.com/openai/codex/blob/main/codex-rs/linux-sandbox/README.md) from Rust, with direct access to the system calls | 🟢🟢🟢<br>- Small static binary, low memory |
| **Go** | 🟢<br>- A small language, learned in weeks, but still not mine | 🟢🟢<br>- Official OpenAI SDK (beta) and MCP SDK, Bubble Tea<br>- [Crush](https://github.com/charmbracelet/crush/blob/main/go.mod) as the reference agent | 🟢🟢<br>- Easy to read, even for people who don't write Go | 🟢🟢<br>- System calls through the standard library, and spawning OS tools is straightforward | 🟢🟢🟢<br>- Single static binary |
| **Python** | 🟢<br>- I read it, but don't use it daily | 🟢🟢<br>- Official OpenAI SDK and MCP SDK, Textual<br>- Aider as the reference agent | 🟢🟢🟢<br>- The most widely read language | 🟢🟢<br>- Same approach as TypeScript: spawn `sandbox-exec` or bubblewrap | 🟠<br>- Needs an interpreter and a virtual environment<br>- Packaging is the weak point |

Scale: 🟢🟢🟢 strong · 🟢🟢 good · 🟢 acceptable · 🟠 weak · 🔴 fails. Sources checked on 2026-10-10.

## Decision

TypeScript.

- It's the only option that leaves all my attention for the agent, which is goal 1.
- The agents I learn from most (Claude Code, Pi, OpenCode) are written in it, and its libraries cover every phase.
- Rust wins on sandboxing and distribution, criteria 4 and 5. Neither matters before Phase 4, and distribution only matters if Orbi gets popular.

Trade-off accepted: Phase 4 sandboxing goes through OS tools instead of system calls, and Orbi needs a runtime or a large binary.

## Consequences

- The runtime has to be chosen next ([ADR-0002](0002-runtime.md)).
- Phase 4 sandboxing wraps `sandbox-exec` and bubblewrap, as Anthropic's sandbox-runtime does, rather than calling the kernel directly.
- Porting one piece to Rust later (the sandbox, or the loop) stays possible, and would make a good article chapter.

## Revisit if

- Orbi gets popular enough that a small binary matters. [ADR-0002](0002-runtime.md) has the same signal.
- Phase 4 needs a sandbox feature that OS tools can't provide from TypeScript.
