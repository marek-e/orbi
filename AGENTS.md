# Working on Orbi

Read `docs/vision.md` before proposing changes. The goal is understanding, so prefer code that shows how things work over code that hides it.

## Decisions

Discuss any decision that is hard to reverse and has real alternatives before implementing it: runtime, provider coupling, storage or session formats, the event contract, dependencies that shape the architecture. Write it up as an ADR following the process in `.claude/skills/adr/SKILL.md`, which validates each step with Marek. Don't build on an ADR until it's accepted.

Easy-to-reverse choices (wording, defaults, small helpers) don't need an ADR.

## Pace

Work one roadmap phase at a time (`docs/roadmap.md`). Explain what you're about to build before building it.

## Vocabulary

Use the terms in `CONTEXT.md` (turn, request, event, sbire, mood).

## Commands

- `bun start` runs the REPL
- `bun run typecheck`
- `bun run lint` runs Oxlint with type-aware rules
- `bun run format` formats with Oxfmt (`format:check` only checks). Markdown is left alone
- `bun run build` writes `dist/orbi`
