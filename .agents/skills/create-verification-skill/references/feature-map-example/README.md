# Orbi verification map

This directory is the maintained source for verifying what a user sees in Orbi's REPL. Read the index before driving Orbi, then use the matching feature file as the recipe.

## Baseline preconditions

- `scripts/orbi-pty` from this skill is executable. It wraps one tmux session per run: `start`, `send`, `wait`, `capture`, `doctor`, `stop`.
- `RUN_ID` is set, and the run directory is `/tmp/orbi-verify-$RUN_ID` with `work/` and `evidence/` inside it.
- The shell has the credentials the current `src/` reads. The Phase 1 draft reads `ANTHROPIC_API_KEY`. After the switch to Sign in with ChatGPT, the token store must hold a signed-in session.
- `orbi-pty start` launches `ORBI_EFFORT=low bun <repo>/src/cli.ts` with `work/` as the working directory, never the repo itself.
- `orbi-pty start` passes the credentials into the session with `tmux new-session -e`. A tmux server started earlier keeps its own environment and would not see them.
- `orbi-pty doctor` reports a live session, a header line that ends in `/exit to quit`, no `· yolo` unless the recipe asks for it, and `work/` as the pane's directory.
- Never drive a tmux session that this run did not start.

## Driving conventions

- Run every command from `/tmp/orbi-verify-$RUN_ID`, so `work/` and `evidence/` resolve.
- Start every recipe from a fresh `orbi-pty start`. One REPL per recipe, because the conversation history carries over between prompts.
- Wait on strings Orbi prints, not on sleeps: `›` for the input prompt, `run it? [y/N]` for approval, `requests ·` for the end of a turn.
- Assert on the shape of the usage line, not on its numbers. Token counts change on every run.
- Treat every command as literal. Keep quoted prompts unchanged.
- Never send `C-c` to end a turn. In Phase 1 it quits the REPL.

## Proof and skip reporting

- REPL proof is the full scrollback from `orbi-pty capture`, saved under `evidence/<feature-id>/`.
- Side-effect proof is a read of `work/` after the turn: the file that exists, or the file that doesn't.
- Record the feature ID and the entry point used with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition, such as missing credentials.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with <harness>` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, the strings Orbi prints, required state, commands, and observable proof.

## Features

- [Run a turn](./run-a-turn.md) covers a prompt, the streamed answer, and the usage line at the end of the turn.
- [Approve a command](./approve-a-command.md) covers the approval prompt for a `bash` call, the approve and refuse paths, and `--yolo`.
