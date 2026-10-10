# orbi

My own coding agent, built from scratch to understand how tools like Claude Code work and to end up with one that fits the way I work.

Orbi is named after the AI companion in my Melo mascot sheet. Subagents, when they come, will be called sbires.

## Status

Nothing usable yet. The project is in the decision phase: see [`docs/vision.md`](docs/vision.md) and [`docs/adr/`](docs/adr/).

The code in `src/` is a first draft written against Anthropic's API before the provider decision. It will be replaced by Phase 1, built on the OpenAI Responses API with Sign in with ChatGPT ([ADR 0006](docs/adr/0006-model-access.md)). It runs with an Anthropic API key (`ANTHROPIC_API_KEY=... bun start`), but nothing builds on it.

## Layout

```
src/
  agent.ts       the loop. Yields events and never prints.
  cli.ts         the REPL. Renders events and asks for approval.
  prompt.ts      the system prompt
  tools/bash.ts  the only tool for now
journal/         dated notes for the article
```

`agent.ts` doesn't know a terminal exists. The REPL, a future TUI and an eval runner are all consumers of the same event stream.

## Docs

- [`docs/vision.md`](docs/vision.md): why Orbi exists, principles, long-run direction, open questions
- [`docs/roadmap.md`](docs/roadmap.md): the phases, and what to decide before each one
- [`docs/adr/`](docs/adr/): architecture decisions, `proposed` until accepted
- [`CONTEXT.md`](CONTEXT.md): the project's vocabulary
- [`AGENTS.md`](AGENTS.md): rules for any coding agent working in this repo
- [`journal/`](journal/): dated notes for the article series
