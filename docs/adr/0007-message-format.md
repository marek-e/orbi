# ADR-0007: Which message format does the core use?

| | |
|---|---|
| **Status** | Accepted · 2026-10-10 (converted to this format on 2026-10-10) |
| **Owner** | Marek Elmayan |
| **Supersedes** | – |
| **Superseded by** | – |
| **Related** | [ADR-0003](0003-anthropic-message-format-in-core.md) (rejected proposal, same question), [ADR-0006](0006-model-access.md) (model access), [ADR-0005](0005-core-emits-events.md) (events), roadmap Phase 3 |

## Context

The core keeps the conversation as a list of messages: what I typed, what the model answered, the tools it called and their results. It sends that list to the model on every request, and from Phase 3 writes it to disk so a session can be resumed.

The primary provider is OpenAI's Responses API ([ADR-0006](0006-model-access.md)), and other providers stay possible: an Anthropic API key, local models. Each provider's API shapes messages differently, and some return data the model needs back unchanged on the next request.

Today the pre-decision draft stores the history in Anthropic's SDK types. Once sessions are on disk, changing the format means migrating every saved session, so it has to be settled before Phase 3.

## Criteria

| # | Criterion | Why it matters for Orbi |
|---|---|---|
| 1 | What goes over the wire stays visible in the code | Goal 1: reading the code should show what the model actually receives |
| 2 | Adding a provider without touching the core, tools, UI or sessions | [ADR-0006](0006-model-access.md) keeps other providers on the table |
| 3 | The session format on disk stays stable | Phase 3 writes sessions to disk and resumes them. A format that follows someone else's releases breaks old sessions |
| 4 | Provider-specific data comes back intact | Reasoning items, thinking blocks and cache hits only work if the next request returns them exactly as received. Losing them costs quality and money |
| 5 | Design effort before a second provider exists | Pace: one roadmap phase at a time, no work for providers I don't use yet |

Numbered by priority, 1 first.

## Options

### Anthropic's format

The history is stored as the Anthropic SDK's message types, and other providers get an adapter from it. What's in place today, and what [ADR-0003](0003-anthropic-message-format-in-core.md) proposed.

### OpenAI's Responses format

The history is stored as Responses API input items, the primary provider's own format. Other providers get an adapter from it.

### Orbi's own format, one adapter per provider

Orbi defines its own message types. Each provider gets an adapter that translates them to and from its API. Pi does this.

### A framework's format

The history is stored as the Vercel AI SDK's message type, and the SDK's providers do the translation.

## Evaluation

| Option | 1. Wire stays visible | 2. Add a provider without touching the rest | 3. Stable session format | 4. Provider data intact | 5. Design effort now |
|---|---|---|---|---|---|
| **Anthropic's format** | 🟠<br>- What's stored is Anthropic's shape, but what goes over the wire to the primary provider is OpenAI's, behind an adapter | 🟠<br>- Every provider, the primary one included, gets an adapter from Anthropic's shape | 🟠<br>- Follows the SDK's beta types, which change with Anthropic's releases | 🟠<br>- OpenAI reasoning items have no place in Anthropic's types | 🟢🟢🟢<br>- What the draft already does |
| **OpenAI's Responses format** | 🟢🟢🟢<br>- With `store: false`, the [history is replayed in full](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations) on every request: the stored list is the wire input | 🟢<br>- Every other provider gets an adapter from OpenAI's shape | 🟠<br>- Follows OpenAI's item types, which change with its releases | 🟢<br>- Reasoning items are native<br>- Anthropic thinking blocks need a place it doesn't have | 🟢🟢🟢<br>- Nothing to design |
| **Orbi's own format** | 🟢🟢<br>- Each adapter is one file that shows exactly how Orbi's messages become a request<br>- One translation step between the history and the wire | 🟢🟢🟢<br>- A new provider is a new adapter. Core, tools, UI and sessions don't change. Pi works this way | 🟢🟢🟢<br>- Changes only when I change it | 🟢🟢<br>- Provider data kept as opaque blobs tagged with provider and model<br>- Replay rules differ: OpenAI reasoning is [reusable within a model family](https://developers.openai.com/api/docs/guides/reasoning), Anthropic thinking blocks are [dropped if anything earlier changed](https://platform.claude.com/docs/en/build-with-claude/thinking) | 🟠<br>- A format to design before the second provider exists to test it |
| **A framework's format** | 🔴<br>- The translation happens inside the Vercel AI SDK<br>- The [vision](../vision.md) lists it as a non-goal | 🟢🟢🟢<br>- Its providers are already written | 🟠<br>- Follows the SDK's major versions. AI SDK 5 changed the [OpenAI default](https://ai-sdk.dev/providers/ai-sdk-providers/openai) to the Responses API | 🟢🟢<br>- `providerOptions` and `providerMetadata` carry encrypted reasoning | 🟢🟢<br>- The types exist, the providers too |

Scale: 🟢🟢🟢 strong · 🟢🟢 good · 🟢 acceptable · 🟠 weak · 🔴 fails. Sources checked on 2026-10-10.

## Decision

Orbi's own format, with one adapter per provider. The core, the tools, the UI and the session log only know Orbi's format.

- OpenAI's Responses format does better on criterion 1: with `store: false` the stored history is literally the request. Orbi's own format wins criteria 2, 3 and 4 together, and the gap on criterion 1 is one adapter file to read.
- Sessions on disk outlive any provider's release cycle, which only a format Orbi controls guarantees.

Trade-off accepted: a format designed before a second provider exists, and one translation step between the history and the wire.

## Consequences

- The format must exist before Phase 3, because that's when sessions get written to disk.
- Provider-specific data the model needs back unchanged (Anthropic thinking blocks, OpenAI reasoning items) is kept as opaque data tagged with the provider and model that produced it. It's replayed only to a model that can read it: the same model family for OpenAI, the same model (or the few that Anthropic lists) for Claude.
- The Claude Code engine doesn't go through this format at all. Claude Code keeps its own history, and Orbi only receives events from it.
- Still open: which second provider tests the format against a different API (an Anthropic API key, a local model behind an OpenAI-compatible server, or something else). Until then the format is designed from one real adapter plus the documentation of the others, which is a known risk.
- Shaping Orbi's format close to Responses items keeps the primary adapter thin and narrows the gap on criterion 1. That's a design choice for Phase 3, not part of this decision.

## Revisit if

- No second provider is in use by the end of Phase 8. Then the adapter layer costs without paying back, and the Responses format would have been enough.
- The providers converge on one shared format for history with reasoning.
