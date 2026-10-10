# Vision

## Why Orbi exists

1. **To understand how coding agents work**, by building every part myself instead of reading about it. I use Claude Code every day. After this project, nothing it does should be a mystery to me.
2. **To have a daily driver that fits me.** A tool I know line by line, so I can change any behavior that gets in my way the same day I notice it.
3. **To write about it.** An article series, one post per phase, built from the journal, the ADRs and the tagged commits.

The first goal comes first. When a shortcut would save time but hide how something works, skip the shortcut.

## Who it's for

Me first. The repo is public, so readers of the articles may clone it and use it, but their needs don't drive decisions. In practice that means only a few things:
- The README is enough to get it running.
- Nothing hardcodes my machine, my paths or my accounts.
- Every user signs in with their own credentials.

Orbi isn't a product. It doesn't need onboarding, configuration for other people's workflows, or backward compatibility beyond my own sessions.

## Non-goals

- Matching Claude Code feature for feature. Orbi gets a feature when I need it, not because Claude Code has it.
- Supporting every provider, editor or operating system. macOS and one provider until there's a real reason for more.
- Depending on agent frameworks (LangChain, Vercel AI SDK, the Claude Agent SDK). They hide the parts I want to see.

## Principles

**Small enough to read in an afternoon.** Pi is the reference. If a module grows past what I can hold in my head, split it or cut it.

**I own the loop and the protocol.** The code talks to the model API directly. Every request and response can be logged and read.

**The core never prints.** The agent emits events. The REPL, a future TUI and the eval runner all consume the same events.

**Safe by default.** Every side effect needs my approval until a real sandbox exists (Phase 4).

**Measured, not guessed.** From Phase 7 on, a change to the system prompt or a tool counts as an improvement only if the evals say so.

**Written down as it happens.** A journal entry per work session, an ADR per structural decision, a git tag per phase.

## How decisions get made

A decision that is hard to reverse and has real alternatives (runtime, provider coupling, storage format, architecture boundaries) gets discussed before it's made, then recorded in [`adr/`](./adr/) as `proposed` until I accept it.

Easy-to-reverse choices (a tool's wording, a default value, a color) don't need an ADR. They go in the journal if they taught me something.

## Long-run direction

- **Daily driver by the end of Phase 3 or 4.** From then on, Orbi builds Orbi.
- **Fitted to my own frictions.** The list of things that annoy me in Claude Code decides what comes after Phase 4. That list doesn't exist yet (see open questions).
- **Later, maybe:** more providers (an Anthropic API key, local models), the Claude Code engine (Phase 8), a client/server split with a GUI, sbires (subagents) working in parallel, a Rust port of one piece such as the sandbox.

## Settled

- **The repo is public**, under the MIT license, so it can be shared as is and linked from every post.
- **The article series is written in English first.**
- **Model access.** The ChatGPT subscription, through Sign in with ChatGPT, is the primary provider. Claude subscription tokens are never used directly. Claude may come back as a Claude Code engine. See [ADR 0006](./adr/0006-model-access.md).

## Open questions

- What are the 5 to 10 frictions in my current Claude Code use that Orbi should fix?
- Which second provider will test Orbi's own message format ([ADR 0007](./adr/0007-message-format.md))? The likely candidate is an Anthropic API key paid from the Max plan's $100 of monthly API credits.
