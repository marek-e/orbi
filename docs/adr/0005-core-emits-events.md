---
status: proposed
date: 2026-10-09
---

# The core emits events, and UIs consume them

The agent core (`src/agent.ts`) never prints. `agent.prompt()` is an async generator that yields typed events (`thinking`, `text`, `tool_call`, `tool_result`, `notice`, `turn_end`), and the REPL renders them. Pi splits its packages along the same line, while Codex and OpenCode go further with a protocol between agent and UI.

This was built into Phase 1 without being discussed. It's cheap now, and gives a headless mode for evals and a TUI later without touching the loop. The event types become the contract that every UI and the eval runner depend on, so they get expensive to change once the TUI exists (Phase 5).

## Considered options

- **Print from the loop.** The simplest, and how most tutorials do it. Rejected because evals and the TUI would each need their own copy of the loop.
- **In-process async generator (current).** One process, no protocol. Backpressure comes for free: the loop waits while the UI renders.
- **Client/server with a protocol** (JSON-RPC over stdio, or HTTP). Codex's app-server and OpenCode work this way. It allows a GUI or an editor extension in another process. It's too early: there is one UI.

## Consequences

- Events should stay plain, JSON-serializable data, so they can go over a wire later if a client/server split happens.
- Approval is the exception today: it's a callback function (`approve`) passed to the agent, which can't be serialized. In a protocol it would become a request event plus a response. If I move to a protocol, approval has to change.
- If the Claude Code engine from [ADR 0006](./0006-model-access.md) happens, Orbi's own loop and the Claude Code engine must emit the same event types, so the UI and the evals work with either one. Events should describe what happened (text, tool call, tool result), not how one engine works inside.
