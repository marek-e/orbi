# Run a turn

A user types a prompt at the `›` prompt, watches the answer stream in, and sees one usage line when the turn ends: requests, input tokens, cached tokens, output tokens.

## Sub-features

- `turn-start` shows the header line with the model and effort, then the `›` prompt.
- `turn-stream` prints the answer as it arrives, with thinking in dim text before it.
- `turn-end` prints `(^‿^)` and the usage line, then returns to `›`.
- `turn-history` keeps the conversation, so a second prompt can refer to the first.
- `turn-exit` quits on `/exit` or `/quit`.

## How to get to it (user POV)

- Run `bun start` in a project and type a prompt.
- Run `orbi` from a build made by `bun run build`.

## Driving it with orbi-pty

Preconditions:

- `orbi-pty doctor` passes for a fresh session.
- `work/` is empty.

- **Start.** Launch Orbi. Run `orbi-pty start` and `orbi-pty wait "›"`. The first line reads `(◕‿◕) orbi · <model> · effort low · /exit to quit`.
- **Prompt.** Ask for an answer that needs no tool. Run `orbi-pty send "Reply with the word pong and nothing else. Do not run any command."` and `orbi-pty wait "requests ·"`. The scrollback shows `pong` after the prompt line.
- **Usage line.** Read the end of the turn. Run `orbi-pty capture`. The last turn ends with `(^‿^) 1 requests · ` followed by `k in`, `k cached`, and `k out` values, then a new `›`.
- **History.** Ask about the first prompt. Run `orbi-pty send "What word did you just reply with? Answer in one word."` and `orbi-pty wait "requests ·"`. The second answer contains `pong`.
- **Proof.** Run `orbi-pty capture > evidence/run-a-turn/scrollback.txt`. The file shows both prompts, both answers, and both usage lines.
- **Exit.** Run `orbi-pty send "/exit"`. `orbi-pty doctor` then reports no live session.

## Gotchas

- The model may still call `bash` on a simple prompt. The approval prompt then blocks the turn. Answer `n` and retry with a stricter prompt rather than approving a command the recipe doesn't need.
- `wait "requests ·"` matches every earlier turn too. Count usage lines in the capture, or capture after each wait.
- The usage line says `1 requests`. That is the real string, not a typo to fix in the map.
- An API error prints `(°o°)!` and the message in red, then returns to `›`. That is a failed drive, not a finished turn.
