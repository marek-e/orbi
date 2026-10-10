# Architecture decisions

Each decision that is hard to reverse and has real alternatives gets an ADR here. The process is in [`.claude/skills/adr/SKILL.md`](../../.claude/skills/adr/SKILL.md) and the structure in its [template](../../.claude/skills/adr/template.md): neutral context, prioritized criteria, options, a scored evaluation matrix, then the decision, its consequences and what would reopen it.

## Lifecycle

- **Proposed**: written up, waiting for my decision. Nothing gets built on it.
- **Accepted**: decided. Changing it later means a new ADR that supersedes it.
- **Rejected**: considered and turned down. Kept as a record.
- **Superseded by ADR-NNNN**: replaced by a later decision.

## Scores

🟢🟢🟢 strong · 🟢🟢 good · 🟢 acceptable · 🟠 weak · 🔴 fails. For yes/no criteria: ✅ yes · ⚠️ partly · ❌ no. `[?]` marks a claim not yet confirmed.

## Index

| ADR | Question | Status | Decision |
|---|---|---|---|
| [0001](0001-language.md) | Which language is Orbi written in? | Accepted | TypeScript |
| [0002](0002-runtime.md) | Which runtime runs Orbi? | Accepted | Bun, with code kept runnable on Node (`node:*` APIs, erasable TypeScript) |
| [0003](0003-anthropic-message-format-in-core.md) | Which message format does the core use? | Rejected | Anthropic's format, replaced by 0007 |
| [0004](0004-agent-loop.md) | Who writes the agent loop? | Accepted | Written by hand on the raw API |
| [0005](0005-core-emits-events.md) | How does the core talk to UIs? | Proposed | Typed event stream, to be decided before Phase 5 |
| [0006](0006-model-access.md) | How does Orbi access models? | Accepted | ChatGPT subscription first, no Claude subscription tokens |
| [0007](0007-message-format.md) | Which message format does the core use? | Accepted | Orbi's own format, one adapter per provider |

0001, 0004, 0006 and 0007 were decided before this format existed and converted on 2026-10-10. Their criteria and options were confirmed then, not invented to fit the decision. 0003 stays a short record: 0007 scores its option. 0005 goes through the full process before Phase 5.
