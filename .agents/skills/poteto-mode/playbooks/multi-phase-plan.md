### Multi-phase plan

**You own the plan, not the code. The plan is a checklist an owner runs box by box and the operator audits from the evidence.** The plan is the deliverable. Do not implement.

A plan covers one roadmap phase from `docs/roadmap.md`, or a slice of one, delivered as an ordered series of commits on `main`. Work that spans phases gets one plan per phase. Write the next phase's plan when the current phase closes (`AGENTS.md`, Pace).

1. When the change is one or two files with an obvious approach, skip the plan. Say so and stop.
2. Find the phase's gates. Read its entry in `docs/roadmap.md`. Each **Decide first** item needs an accepted ADR in `docs/adr/`. When one is missing, draft it as `proposed` per `.claude/skills/adr/SKILL.md`. Keep planning. The plan lists each unaccepted ADR as an operator gate, and the commits that rest on it wait for it.
3. Settle open questions by prototype before you write. Run `playbooks/prototype.md` for each. Keep the scratch path, the commands, and the captured output for Appendix A. Ask the operator only about a product or preference call that no run can settle. Give options (the **never-block-on-the-human** principle skill).
4. Explore in subagents. Spawn the `poteto-agent` agent from `.agents/agents/` with an explicit model per the Subagents section (the **guard-the-context-window** principle skill). Each returns file pointers, conventions, check commands, and entry points. No inlined dumps.
5. Copy the skeleton below into the plan file and fill every placeholder. Unless the operator names a path, write it to `journal/YYYY-MM-DD-phase-<n>-plan.md`, which stays local because `journal/` is gitignored. Keep every heading and every sub-block in the order shown. One section per commit. One commit is one change with its own evidence (the **sequence-verifiable-units** principle skill). The plan runs under `playbooks/autonomous-run.md`, and each commit section names the playbook that builds it (Feature, Refactoring, or Bug fix).
6. Write under the **technical-writing** skill in full, then the **unslop** skill. The body is one Diátaxis mode, how-to. Appendices hold explanation and reference. Each heading states the task or the finding. No long dashes. No mid-sentence colons.
7. Check the structure by hand and fix every miss.
   - Every heading and sub-block of the skeleton is present, in order.
   - `grep -n '<[A-Za-z]' <plan.md>` prints no leftover skeleton placeholder. Only the boot recipe's per-lane variables (`<n>`, `<SHA>`, `<slug>`, `<commit-id>`) may stay.
   - Every box names the evidence that checks it.
   - Every **Verify** block opens with the verification rule sentence.
   - Every commit section has **Depends on** and **Playbook**, and the dependency graph under **Spawn owners** matches them.
   - Every commit that changes an interaction has review-gate boxes. Every other commit has the one-line `None` form.
8. Hand back. Post the plan path and the result of each structure check, then stop. Execution starts on the operator's explicit go, under `playbooks/autonomous-run.md`.

**Verification.** Tests alone are not sufficient verification. A commit is verified only when its unit, live, and perf boxes are all checked (the **prove-it-works** principle skill). That sentence is the verification rule. Every verification block opens with it. The live block is mandatory. Ten lanes at the commit drive the real REPL per the **swarm** skill, on the `swarm workers` model (the code model by default). Each lane is one box with a concrete scenario, the transcript it saves, and its pass predicate. One lane is the **Regression lane against the parent commit.** It runs the same load-bearing scenario at the parent and at the commit. If the parent does not have the feature, the lane records that fact and gates the behavior the diff adds plus the end state the user waits for instead of inventing a parent result. The perf gate is dual-sided. Parent and commit must both produce the named metric. Orbi's usual metrics are requests and tokens per turn, latency to the first event, and startup time. If the parent lacks the feature, also isolate the work the diff adds and set an absolute budget for that work plus the end-to-end state the user waits for. Do not claim a ratio between unlike scenarios. The perf block names the metric, the interleaved probe, the parent baseline measured first, and the rule with the number that fails. A commit that changes what Marek sees or types in the REPL (output, prompts, the approval flow) or the event types is review-gated. The operator reviews its transcripts and recording before it is pushed. A commit that changes no interaction writes `**Review gate.** None. <commit id> is not review-gated.` and no boxes under it.

**Driving the REPL.** Live lanes drive Orbi the way Marek does. They start it in a pseudo-terminal (the harness's terminal tool, tmux, or `script`), type the prompt, answer each approval prompt, and save the session transcript. If the repo has a verification skill (create one with the **create-verification-skill** skill), lanes use it. Until Phase 4's sandbox exists, every command a lane approves runs on Marek's machine. So each lane runs Orbi inside its own copy of the toy repo and approves only commands that stay inside it. A surface no lane can drive is a risk in Appendix C, and its live block still names how each lane drives it.

````markdown
# <Phase or slice> plan

<Under ten lines. What changes, for whom, the roadmap phase and its Done when line, the rule the phase enforces, and the commit ids in order.>

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a transcript, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The plan runs `.agents/skills/poteto-mode/playbooks/autonomous-run.md`. Its predicate is "every box in this plan is checked with its evidence". Each commit is built under the playbook its section names and lands on `main` per `.agents/skills/poteto-mode/playbooks/committing.md`. Accepting an ADR, tagging, and pushing are the operator's.

Tests alone are not sufficient verification. A commit is verified only when its unit, live, and perf boxes are all checked.

## Phase checklist

### Arm the phase

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on the operator's explicit go.
- [ ] Check the gates. Each **Decide first** item in `docs/roadmap.md` has an accepted ADR.
  - [ ] ADR <NNNN> is `Accepted` in `docs/adr/README.md`. <Commit ids> wait until it is.
- [ ] Read these at phase start. Re-read them before each commit.
  - [ ] `docs/roadmap.md`, the phase's entry.
  - [ ] `.agents/skills/poteto-mode/playbooks/autonomous-run.md`
  - [ ] `.agents/skills/poteto-mode/playbooks/committing.md`
  - [ ] `.agents/skills/swarm/SKILL.md`
  - [ ] `.agents/skills/<each other leaf skill the phase uses>/SKILL.md`
- [ ] On the operator's go, arm the wake mechanism per step 2 of the Autonomous run playbook with the tick prompt below. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read this plan and the Autonomous run playbook. Audit the work against them and fix drift in this tick. Probe every active lane and judge progress by side effects only, such as commits, files, and logs. Stand down a stuck lane and dispatch its replacement now. Then post a short status message to the operator only when the audit found a tracked change that no earlier status message reported, such as a commit landed, a verdict, a stuck agent and the action taken, a blocker added or cleared, or a decision only the operator can make. Name every such change and nothing else. If the audit found none, end the turn with no reply text. Either way, log this tick's row in your decision trail. The row names the items reported, or none."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per commit, or one owner for a code-coupled run of commits, with the playbook each section names.
- [ ] Follow this dependency graph. A commit starts only after its parent lands on `main`.
  - [ ] <Commit id> and <commit id> are independent and first. Each builds in its own git worktree off `main`, and they land in the order listed.
  - [ ] <Commit id> after <commit id>.
- [ ] Hold the file boundaries. <Commit id or class> touches only `<glob>`.
- [ ] Hold the review gate. <Commit ids> change an interaction. Their transcripts and recording wait for the operator's review before any push.

### Commit mechanics, for every commit

- [ ] `bun run typecheck` passes on the exact tree staged, and `bun test` too once tests exist.
- [ ] Run the **no-comments** skill over the diff before staging.
- [ ] Write the message per `.agents/skills/poteto-mode/playbooks/committing.md`. No AI attribution trailer.
- [ ] An owner in a worktree rebases onto current `main` before the verdict. Keep that base through fix rounds. Rebase again only when `main` moved under a file the commit touches.
- [ ] Push nothing.

### Verdict and landing, for every commit

- [ ] At the code-ready SHA, and at each later change to the patch, run the swarm per `.agents/skills/swarm/SKILL.md`. One gates lane (typecheck, tests, `bun run build`). The ten live lanes from the commit's **Verify, live** block. The perf lane from its **Verify, perf** block. Two or more audit lanes, each with its own focus, that read the diff and the receipts and distrust the owner's report. The root audits the receipts before the verdict.
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner, including a defect that a lane filed as a note. A new patch gets a fresh swarm and a fresh verdict. A rebase that leaves `git patch-id` unchanged keeps the verdict.
- [ ] Land in plan order. Cherry-pick the verified SHA onto `main`, rerun the gates lane there, and record the new SHA.

### Boot recipe, for every live lane

Each live lane runs in its own git worktree at the commit and drives the REPL as described in **Driving the REPL**.

- [ ] `git worktree add <scratch>/lane-<n> <SHA>`, then `bun install` in it.
- [ ] Copy the frozen toy repo to `<scratch>/lane-<n>-repo`. Orbi runs there.
- [ ] From that repo, start `bun <scratch>/lane-<n>/src/cli.ts` in a pseudo-terminal. Wait for the prompt.
- [ ] <Deliver input only by typing into the REPL. Approve only commands that stay inside the toy repo copy. Name the read-only diagnostics.>
- [ ] Save every transcript to `/tmp/swarm-<commit-id>/worker-<n>/<slug>.txt` and return the paths with the report.

## <Task as a verb phrase> (<commit id>)

**Depends on.** <Commit id, an ADR, or None.>

**Playbook.** <Feature, Refactoring, or Bug fix.>

**Files.**

- [ ] Edit `<path>`.
- [ ] Create `<path>`.
- [ ] Delete `<path>`.

**Build.**

- [ ] <One change. Name the symbol and the file.>

**You see.**

- [ ] <One observable result, with the exact REPL output or the event emitted.>

**Verify, unit.** Tests alone are not sufficient verification. A commit is verified only when its unit, live, and perf boxes are all checked.

- [ ] <Test file and the case it gains.> Run `bun test <file>`.

**Verify, live.** Tests alone are not sufficient verification. A commit is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `<swarm workers model>` at the commit, per the boot recipe.

- [ ] Lane 1. Regression lane against the parent commit. Run <the same load-bearing scenario> at the parent and at the commit. If the parent lacks the feature, record that and gate <the behavior the diff adds plus the end state the user waits for>. Save `<slug>.txt`. Pass when <predicate>.
- [ ] Lane 2. <Scenario.> Save `<slug>.txt`. Pass when <predicate>.
- [ ] Lane 3. <Scenario.> Save `<slug>.txt`. Pass when <predicate>.
- [ ] Lane 4. <Scenario.> Save `<slug>.txt`. Pass when <predicate>.
- [ ] Lane 5. <Scenario.> Save `<slug>.txt`. Pass when <predicate>.
- [ ] Lane 6. <Scenario.> Save `<slug>.txt`. Pass when <predicate>.
- [ ] Lane 7. <Scenario.> Save `<slug>.txt`. Pass when <predicate>.
- [ ] Lane 8. <Scenario.> Save `<slug>.txt`. Pass when <predicate>.
- [ ] Lane 9. <Scenario.> Save `<slug>.txt`. Pass when <predicate>.
- [ ] Lane 10. <Scenario.> Save `<slug>.txt`. Pass when <predicate>.

**Verify, perf.** Tests alone are not sufficient verification. A commit is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. <What is measured at both the parent and the commit, such as requests and tokens per turn on the toy task, latency to the first event, or startup time. If the parent lacks the feature, also name the diff-added work and the end-to-end state the user waits for.>
- [ ] Probe. <The command or procedure, run at the parent and at the commit, interleaved, median of N. Both sides must produce the metric.>
- [ ] Baseline. Record the parent's <value> first.
- [ ] Rule. <Commit against parent, with the number that fails. If the scenarios differ, add absolute budgets for the diff-added work and the user-visible end state instead of an invalid ratio.>

**Review gate.** The operator reviews before any push.

- [ ] Copy lane <n> transcripts into `<media path>/<commit-id>-review-<slug>.txt`.
- [ ] Record the scenario end to end with `script -r <media path>/<commit-id>-review.script`, so the operator can replay it with `script -p`.
- [ ] Post the transcripts and the recording path in chat. The commit stays unpushed until the operator has reviewed it.

**Land.**

- [ ] Root's clean verdict at the exact SHA.
- [ ] Rebased onto current `main` after the verdict, patch-id unchanged.
- [ ] Cherry-picked onto `main`, gates lane green there, new SHA recorded.

## Close the phase

- [ ] Every box above is checked with its evidence.
- [ ] The phase's **Done when** line holds, with the evidence it names recorded. <The measurement or run it names.>
- [ ] Propose the annotated tag and the journal entry per `.agents/skills/poteto-mode/playbooks/committing.md`. Tagging and pushing stay with the operator.
- [ ] Reply to the operator with the report the Autonomous run playbook names.

## Appendix A. Prototype evidence

<Each open question a prototype answered, with the scratch path, the commands, and the captured output. Each question that stays unproven.>

## Appendix B. Alternatives rejected

<Each approach weighed and why it lost. Link the ADR when one records it.>

## Appendix C. Risks

<Each risk with the commit it lands in and what the owner watches.>

## Appendix D. Links and reading list

<Docs to read before editing, including the ADRs the phase rests on. Which commits get `.agents/skills/how/SKILL.md` and `.agents/skills/interrogate/SKILL.md`. The trail per `.agents/skills/show-me-your-work/SKILL.md`.>
````

**Reply:** the plan path, the commit ids with their dependencies and the review-gated set, the ADR gates and their status, what the prototypes proved and what stays unproven, and the result of each structure check.
