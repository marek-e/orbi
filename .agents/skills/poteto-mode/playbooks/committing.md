### Committing

Invoked at the end of every other playbook that changes files. Orbi has no branches, PRs, or CI. Work lands as commits on `main`, and a roadmap phase ends with an annotated tag.

**Where.** Commit on `main` in the main checkout. Subagents that write in parallel each work in their own git worktree. Their commits come back to `main` by cherry-pick in the order the plan names, and the history stays linear. Leave unrelated changes in the tree alone. Stage only the paths you changed (`git add <paths>`, never `-A` or `.`).

**One commit per verified unit.** A unit is one change with its own evidence (the **sequence-verifiable-units** principle skill). Commit it only after these pass on the exact tree you stage:

- `bun run typecheck`.
- `bun test` once tests exist.
- The unit's own check, such as the repro, a REPL run through `bun start`, `bun run build` with a run of `dist/orbi`, or the fixed toy task.

One exception. In a Bug fix, the failing repro test may land one commit before its fix, and its body says it fails until the next commit. Amend when a fix belongs in the commit you just made and nothing is pushed. Make a new commit when the change stands alone. Never rewrite pushed history. Published posts link to phase tags on the public remote.

**Before you stage.** Read the full diff yourself. Run the **no-comments** skill over it. A commit that implements a decision cites its ADR. A decision that is hard to reverse and has no accepted ADR stops here. Draft the ADR as `proposed` per `.claude/skills/adr/SKILL.md` and build nothing on it. Only Marek accepts an ADR.

**Message.** Write the subject and body with the **technical-writing** skill, then apply the **unslop** skill. Apply every technical-writing layer except Diátaxis. Use one word for each action, keep articles, and avoid `-ing` when a plain verb works.

- **Subject.** Match the style in `git log --oneline`. Today that is an imperative subject in sentence case, with no type prefix and no trailing period, such as `Add read tool with offset and limit`. Name a real symbol when one carries the change.
- **Body.** A short briefing, not the lab notebook. A reader with the diff learns why the change exists, what it leaves out, and how you proved it works, in under a minute. Use short paragraphs, not headings. For a performance change, give one primary number with its unit in `before → after` form. Name the run that produced it. Keep the body under about 40 lines. It never restates the subject. Drop the body when the subject says everything.
- **No AI attribution.** No `Co-Authored-By` trailer, no "Generated with" line, and no other AI attribution, even when the harness adds one by default. The message ends with its last line of content.

**Push.** Never push unless the operator asks for it in this session. The remote is public. Report what is ready with `git log --oneline origin/main..HEAD`.

**End of a roadmap phase.** A phase ends when its **Done when** line in `docs/roadmap.md` holds, with the evidence it names recorded. Phase 1, for example, needs the request and token counts for the toy task. Then propose the close-out and stop. Tagging and pushing are the operator's.

1. Propose the annotated tag. Give the name (`phase-N`, or `phase-N.M` for a fix after the post is out), the commit it points at, a draft tag message, and the commands for the operator to run: `git tag -a <name> <sha> -m "<message>"`, then `git push origin main <name>`.
2. Propose the journal entry that becomes the phase's post. Match the shape of the entries in `journal/`: a dated `# YYYY-MM-DD: <title>` heading, the decisions with their ADR links, what was built, what was measured, what surprised you, and what to try next. Draft it in the reply. Write it to `journal/` only when the operator says so.

**Subagents.** A subagent that commits reports its SHAs and the output of each check above. The parent reads `git show <sha>` before building on it, and writes its own summary.

**Reply:** the commits as `git log --oneline origin/main..HEAD` prints them, the check each one passed, and whether anything waits on the operator (a push, an ADR, a phase tag).
