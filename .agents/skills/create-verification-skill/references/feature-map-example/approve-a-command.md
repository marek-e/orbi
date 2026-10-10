# Approve a command

When the model asks to run a `bash` command, Orbi shows the command and asks the user before running it. Approving runs it in the working directory and shows the output. Refusing sends a refusal back to the model, which continues the turn without the command.

## Sub-features

- `approve-prompt` shows `(⊙_⊙) $ <command>` and then `(°o°)! run it? [y/N]`.
- `approve-yes` runs the command on `y` and shows up to 8 lines of output in dim text.
- `approve-no` refuses on `n` or on a bare Enter, and shows `The user declined to run this command.` in red.
- `approve-yolo` skips the prompt when Orbi starts with `--yolo`, and the header shows `· yolo`.

## How to get to it (user POV)

- Ask Orbi for anything that needs a shell command, at the `›` prompt.
- Start Orbi with `bun src/cli.ts --yolo` to approve every command.

## Driving it with orbi-pty

Preconditions:

- `orbi-pty doctor` passes for a fresh session started without `--yolo`.
- `work/` contains no `approved.txt` and no `refused.txt`.

- **Ask for a command.** Run `orbi-pty send "Use bash to run: echo ok > approved.txt"` and `orbi-pty wait "run it? [y/N]"`. The line above the question starts with `(⊙_⊙) $` and contains `approved.txt`.
- **Approve.** Run `orbi-pty send "y"` and `orbi-pty wait "requests ·"`. The output line `[no output]` appears in dim text, and `cat work/approved.txt` prints `ok`.
- **Refuse.** In a fresh session, run `orbi-pty send "Use bash to run: echo no > refused.txt"`, `orbi-pty wait "run it? [y/N]"`, and `orbi-pty send ""`. The red line `The user declined to run this command.` appears, the turn still ends with a usage line, and `work/refused.txt` does not exist.
- **Yolo.** Run `orbi-pty stop`, then `orbi-pty start --yolo`. The header shows `· yolo`. Send the approve prompt again. The command line appears with no `run it?` question, and `work/approved.txt` exists.
- **Proof.** Run `orbi-pty capture > evidence/approve-a-command/<sub-feature>.txt` after each sub-feature, then `ls -la work > evidence/approve-a-command/work.txt`.

## Gotchas

- Assert on the file in `work/`, not on the exact command text. The model may quote or reword the command.
- After a refusal the model may try another command in the same turn. Refuse each one until the usage line appears.
- A command that exits non-zero is not a refusal. Its output ends with `[exit code N]` in dim text, not red.
- Every `bash` call starts a fresh shell. A `cd` in one call does not move the next one.
- `--yolo` runs whatever the model writes. Use it only in a session whose working directory is `work/`.
