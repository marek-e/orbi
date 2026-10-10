# ADR-0006: How does Orbi access models?

| | |
|---|---|
| **Status** | Accepted · 2026-10-10 (converted to this format on 2026-10-10) |
| **Owner** | Marek Elmayan |
| **Supersedes** | – |
| **Superseded by** | – |
| **Related** | [ADR-0004](0004-agent-loop.md) (agent loop), [ADR-0007](0007-message-format.md) (message format), [research note](../research/2026-10-model-access.md), roadmap Phases 1 and 8 |

## Context

Orbi needs a model to talk to from Phase 1. I pay for a Claude subscription (used daily through Claude Code) and a ChatGPT subscription. I have no API key for either provider.

I first assumed Orbi would run on the Claude subscription, since that's the one I use every day. Research showed that each way of reaching a model ties together three things: who runs the loop, who pays, and what the provider's terms allow. The answer changes what Phase 1 builds, which API the loop is written against, and what readers need to run Orbi.

### Constraints

- **Provider terms.** The repo is public, so any login Orbi ships is offered to every reader. Anthropic forbids third-party apps from using Claude.ai credentials, and has enforced it in 2026 ([research note](../research/2026-10-model-access.md)).
- **No API key today**, and no wish to start paying per token.

## Criteria

| # | Criterion | Why it matters for Orbi |
|---|---|---|
| 1 | The loop stays in Orbi | [ADR-0004](0004-agent-loop.md): writing the loop is the point of the project |
| 2 | No per-token cost | I already pay for two subscriptions and have no API key. Daily use at API prices would add up |
| 3 | Model quality for daily coding | Goal 2: Orbi has to be good enough to replace Claude Code for real work |
| 4 | Readers can sign in with their own account | The vision: nothing hardcodes my accounts, and the README is enough to get it running |

Numbered by priority, 1 first.

## Options

### Claude subscription tokens, used directly

Orbi signs in with a Claude.ai account and calls the API with that token, as Pi's older login and OpenCode's removed one did. Kept to record why it's ruled out.

### Claude Code through the Claude Agent SDK

Orbi drives the user's own Claude Code install, which uses their Claude subscription. T3Code works this way.

### An Anthropic API key

Orbi calls the Claude API directly with a key from the Claude Console, billed per token.

### Sign in with ChatGPT

Orbi signs in with a ChatGPT account (OAuth with PKCE) and calls OpenAI's public Responses API against the user's plan.

### Local models through Ollama

Orbi talks to a model running on the user's machine through Ollama's OpenAI-compatible API.

## Evaluation

| Option | 1. Loop stays in Orbi | 2. No per-token cost | 3. Model quality | 4. Readers use their own account |
|---|---|---|---|---|
| **Claude subscription tokens** | 🟢🟢🟢<br>- Orbi's own loop | 🟠<br>- Since April, requests through third-party apps [draw from extra usage](https://github.com/earendil-works/pi/issues/3372), not plan limits | 🟢🟢🟢<br>- The Claude models I use daily | 🔴<br>- Ruled out by the constraint: Anthropic [forbids](https://code.claude.com/docs/en/legal-and-compliance) third-party apps from handling Claude.ai credentials, and a public repo offers the login to every reader |
| **Claude Code via Agent SDK** | 🔴<br>- Claude Code runs the loop, the history, caching and compaction. Orbi only sees results | 🟢🟢🟢<br>- [Counts against the subscription](https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan) | 🟢🟢🟢<br>- Claude Code itself | 🟢🟢<br>- Readers need Claude Code installed and a Claude plan |
| **Anthropic API key** | 🟢🟢🟢<br>- Orbi's own loop | 🟢<br>- Billed per token<br>- My Max 5x plan includes [$100 of API credits a month](https://platform.claude.com/docs/en/about-claude/api-credits-for-subscribers), which any API key in the linked Console organization can spend. They don't roll over, and past them it's paid | 🟢🟢🟢<br>- The Claude models I use daily | 🟢🟢<br>- Readers bring their own key. Few people have one without a reason to |
| **Sign in with ChatGPT** | 🟢🟢🟢<br>- Orbi's own loop, within [request rules](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations): `store: false`, `stream: true`, no system-role items, no hosted tools | 🟢🟢🟢<br>- Counts against the ChatGPT plan, with a weekly cap I set per app | 🟢🟢<br>- The models in my account's [catalog](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference), GPT's current coding models<br>- I haven't used them daily yet. Phase 1 will tell | 🟢🟢🟢<br>- Any ChatGPT account, and [open-source projects are explicitly allowed](https://developers.openai.com/siwc) |
| **Local models (Ollama)** | 🟢🟢🟢<br>- Orbi's own loop. Ollama [supports the Responses API](https://docs.ollama.com/api/openai-compatibility), stateless only | 🟢🟢🟢<br>- Free | 🟠<br>- Models that fit on a laptop are well behind the frontier for multi-step coding work | 🟢🟢<br>- Readers install Ollama and need a machine that can run a model |

Scale: 🟢🟢🟢 strong · 🟢🟢 good · 🟢 acceptable · 🟠 weak · 🔴 fails. Sources checked on 2026-10-10.

## Decision

Sign in with ChatGPT as the primary access, from Phase 1. Claude subscription tokens are never used directly.

- It's the only option that keeps the loop in Orbi without per-token cost, criteria 1 and 2 together.
- Readers can follow with any ChatGPT account, and OpenAI explicitly allows open-source projects.
- Claude Code through the Agent SDK is legal and free on my plan, but gives up the loop. It returns as a second engine in Phase 8, for comparison.

Trade-off accepted: Orbi's daily model is not the one I use daily today, and Phase 1 includes an OAuth flow before the first request.

## Consequences

- Phase 1 is rebuilt on the OpenAI Responses API and includes the Sign in with ChatGPT flow (OAuth with PKCE, a local callback, token refresh). The first draft of Phase 1, written against Anthropic's API before this decision, will be replaced.
- Orbi needs its own message format ([ADR-0007](0007-message-format.md)).
- An Anthropic API key, paid from the Max plan's monthly credits, is the cheapest way to bring Claude into Orbi's own loop. It's the natural candidate for the second provider that [ADR-0007](0007-message-format.md) leaves open.
- A "Claude Code engine" phase goes on the roadmap after evals exist, so it can be compared with Orbi's own loop on the same tasks.

## Revisit if

- Anthropic opens subscription access to custom loops. It changed this policy twice in 2026.
- The GPT models in my catalog turn out not to be good enough for daily work. Then the Anthropic API key, within the monthly credits, becomes the primary access.
- OpenAI tightens the Sign in with ChatGPT rules or limits for open-source projects.
