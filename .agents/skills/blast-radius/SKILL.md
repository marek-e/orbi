---
name: blast-radius
description: "Find what a change could break somewhere else before it ships, beyond the diff, and prove the one fact it's safe because of by running real code instead of writing it up. Use for 'blast radius of X', 'what could this break', or reviewing a small diff you don't trust."
disable-model-invocation: true
---

# Blast radius

Find what a change breaks somewhere else, before it ships. Use for "blast radius of X", "what could this break", or reviewing a small diff you don't trust yet.

Companion to `how` and `why`. `how` tells you what the code does. `why` tells you why it's shaped that way. Blast radius tells you what it breaks somewhere else.

Listing the callers is not the job. The agent can grep those in a second. The job is the breakage grep won't show you.

## Don't trust your own writeup

A blast-radius writeup that sounds right is worthless. It reads as convincing whether or not it's true. So don't hand back the writeup. Find the one or two facts the whole thing depends on and prove them by running code.

### How sure are you

For each fact the change's safety depends on, get it as far down this list as is cheap, and say where it stopped.

1. You said so. Worthless on its own.
2. You pointed at the line. A real `file:line`, or the library's own source.
3. You showed the bad case can't happen. You walked the failure step by step and it doesn't reach.
4. You ran it. A script or test that calls the real code and fails loud if you're wrong.
5. You reproduced it in a real turn (`bun start`, or the built `dist/orbi`).

Step 4 is usually one small script, run with `bun`, that imports the real module or the same library Orbi ships and calls the exact function you're worried about.

## Steps

1. Read the change. The diff, the symbols it adds, changes, and deletes, and what it now does differently, including the part the diff doesn't spell out. Use `why` step 2 to pull the commits and any ADR or journal entry behind them.
2. Find the one fact it's safe because of. Most changes that look risky are safe because of a single fact, like "this call only drops already-dead cache entries and does nothing else". Find that fact. If it holds, most risky cases are cleared at once. Spend your time here, not on a long list of maybes.
3. Look where grep stops. Read the source of the library you call, and check its pinned version in `bun.lock`. Work out when things run: the order events come out of the async generator, what happens when a consumer stops iterating early, a subprocess that outlives its turn. Then check Orbi's coupling points, where a change reaches code or behavior a symbol search won't show:
   - **The `AgentEvent` union** (`src/agent.ts`). The REPL consumes it today, the TUI (Phase 5) and the eval runner (Phase 7) later. A new, renamed, or reordered event changes every consumer, including the ones in a `switch` with a silent `default`.
   - **The provider adapter and Orbi's message format** (ADR 0007). A field the adapter drops, renames, or maps differently changes what the model sees, with no type error on either side.
   - **Tool schemas the model sees.** A tool's name, description, or parameter wording is part of the prompt. Rewording it changes what the model does, and nothing in the code calls it.
   - **The session log on disk** (from Phase 3). Sessions written before the change still have to resume after it.
   - **The system prompt** (`src/prompt.ts`). It's the cached prefix of every request, so anything that varies between requests (a timestamp, an unstable order) breaks the cache and raises the cost of every turn.
4. Be honest about each risk. Give it a real chance of happening and a real cost if it does. Keep the risks you confirmed. List the ones you checked and cleared separately. Same rules as `why`. Cite a real `file:line`, a search that finds nothing is still an answer, and never make up a caller or an API.
5. Prove the one fact. Write a script or test that runs the real code, run it, and paste what happened.
6. For a big or wide change, run it as an `arena`. Ask more than one model the same question (a different model family when the harness offers one; otherwise the same model with an independent brief and no shared context) and merge the answers. Different models catch different real bugs.

## What to hand back

- **What it does.** What changed, including the part that isn't obvious.
- **The one fact it's safe because of.** State it, say which step you got it to, and show the proof. If you couldn't prove it, write unproven.
- **Risks.** Each names how it breaks, the `file:line`, how likely and how bad, and how to check. Paste the proof for the ones that matter.
- **Cleared.** What you checked and why it's fine.
- **Before you commit.** The cheapest test or repro that catches the real bug, including the script you wrote. For a change to a tool schema or the system prompt, that's a real turn, and from Phase 7 an eval run.

Write it through `unslop`, cite real code, and strip anything private (tokens, paths from your machine) before it goes anywhere public. The repo is public.

**Reply:** the writeup above, with the one safety fact either proven or marked unproven.
