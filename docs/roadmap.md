# Roadmap

Each phase ends with an annotated git tag (`phase-1`, `phase-2`, ...) and a journal entry that becomes a post in the article series. The repo is public, so each post links to the tag on GitHub, and a reader can check out that exact step and run it.

Tags, not branches: a tag never moves, so a link in a published post always shows the code the post describes. If a phase needs a fix after its post is out, the fix gets a new tag (`phase-2.1`) and the post links to it.

Some decisions have to be settled before a phase starts, because the phase makes them hard to undo. They're listed under "Decide first".

## Phase 0: observe Claude Code

Put a logging proxy between Claude Code and the API and read what it sends: the system prompt, tool schemas, where cache breakpoints go, what compaction and subagent requests look like.

- **Done when:** I have annotated captures of a few real sessions.
- **Article:** what Claude Code actually sends.

## Phase 1: the loop

Sign in with ChatGPT (OAuth with PKCE, a local callback, token storage and refresh), then a REPL, streaming from the OpenAI Responses API, one `bash` tool, approval before each command. See [ADR 0006](./adr/0006-model-access.md).

- **Status:** not started. A first draft written against Anthropic's API, before the provider decision, sits in `src/` and will be replaced.
- **Runtime:** Bun, with code kept runnable on Node ([ADR 0002](./adr/0002-runtime.md)).
- **Done when:** Orbi, signed in with my ChatGPT account, fixes a failing test in a toy repo, and I've recorded how many requests and tokens it took.
- **Article:** an agent is a loop of about 60 lines, and signing in is a story of its own.

## Phase 2: real tools

`read` with line numbers and offset/limit, `write`, `edit` as exact string replacement that refuses ambiguous matches, loading `AGENTS.md`, error messages written for the model.

- **Done when:** on the Phase 1 task, Orbi stops using `cat` and `sed -i` and gets the edit right the first time.
- **Article:** why Claude Code's edit tool works the way it does.

## Phase 3: context and sessions

Prompt caching, token counting, compaction near the context limit, an append-only session log on disk, resume.

- **Decide first:** [ADR 0007](./adr/0007-message-format.md) is accepted, but the format itself must be designed before this phase, because sessions are written to disk in it.
- **Done when:** I use Orbi for a full day of real work.
- **Article:** what a long session costs, and how caching changes it.

## Phase 4: control and safety

Ctrl-C cancels the current turn and its subprocess cleanly. Permission rules instead of asking every time. Git checkpoints and undo. A macOS sandbox for commands, modeled on Codex.

- **Decide first:** sandbox approach (Seatbelt profiles, containers, or both).
- **Article:** letting a model run commands on my machine.

## Phase 5: TUI

A status line with Orbi's moods, streaming markdown, diffs, better input editing.

- **Decide first:** [ADR 0005](./adr/0005-core-emits-events.md) (the event types become the contract the TUI is built on), then the TUI library.
- **Risk:** this phase can eat all the time there is. Give it a time limit.

## Phase 6: extensibility

Slash commands, skills, hooks, an MCP client, and sbires (subagents with their own fresh context).

## Phase 7: evals

A set of my own real tasks, run headless, scored on every change to the prompt or the tools.

- **Article:** measuring whether a prompt change helped.

## Phase 8: the Claude Code engine

Orbi's UI drives Claude Code through the Claude Agent SDK, using the Claude subscription. Then the same eval tasks run through both engines: Orbi's own loop and Claude Code's.

- **Why:** it's the legal way to use the Claude subscription ([ADR 0006](./adr/0006-model-access.md)), and the comparison shows what Claude Code does better or worse than my own loop.
- **Decide first:** [ADR 0005](./adr/0005-core-emits-events.md) must hold for both engines.
- **Article:** my loop against Claude Code's, measured on the same tasks.
