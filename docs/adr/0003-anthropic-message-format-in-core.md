# ADR-0003: Use Anthropic's message format as Orbi's internal format

| | |
|---|---|
| **Status** | Rejected · 2026-10-10 |
| **Owner** | Marek Elmayan |
| **Supersedes** | – |
| **Superseded by** | – |
| **Related** | [ADR-0006](0006-model-access.md) (model access), [ADR-0007](0007-message-format.md) (the accepted answer to the same question) |

Kept as a record. It was written before the current ADR format, and isn't converted: [ADR-0007](0007-message-format.md) answers the same question with the full evaluation, and scores this option there.

## What was proposed

Phase 1 stored the conversation as `Anthropic.Beta.BetaMessageParam[]`, the SDK's own types, without this being discussed. This ADR proposed keeping that for now: one provider, no translation layer, and access to every Anthropic feature (thinking blocks, cache breakpoints, refusal fallbacks) exactly as the API defines them.

## Why it was rejected

OpenAI became the primary provider ([ADR-0006](0006-model-access.md)). Storing the history in the format of a provider Orbi no longer uses first made no sense, and other providers stayed on the table, so Orbi got its own format instead ([ADR-0007](0007-message-format.md)).
