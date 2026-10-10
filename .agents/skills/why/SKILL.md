---
name: why
description: "Use for 'why does X work this way', 'why we picked Y', design rationale, regressions, or where a number came from. Searches git history and Orbi's own records (ADRs, vision, roadmap, research notes, journal, phase tags) in parallel, then returns a cited read on decisions and tradeoffs. Use how for runtime behavior."
disable-model-invocation: true
---

# Why

Investigate the motivation and intent behind code.

Companion to the `how` skill. `how` answers what the code does and how it works. `why` answers what forces led to its shape.

Each spawn below names a role line in `~/.agents/pstack-models.md` and a default role. Use that line's model when the file and the line exist. Otherwise use the default role's model. The **code model** is fast and capable, for routine work. The **judgment model** is the strongest available, for prose and judgment. A value of `auto` or `inherit-parent` means the subagent runs on the session's model. If the harness can't set a model per subagent, every spawn runs on the session's model. If the harness rejects a configured model, use the default and say so.

## Operating Posture

Operate as a **careful, cautious, and precise investigator**. Be honest about what you know vs what you're inferring. Read `references/epistemics.md` for the full confidence framework and phrasing guide. The synthesizer must follow it.

## Step 1. Understand the Target and the Question

Parse what the user is asking. The **target** is usually a chunk of code, a pattern, a feature, or a named design decision. The **question** is usually a design rationale, a tradeoff, a motivating edge case, an external constraint, dead code, or a broad history sweep.

If the target is vague ("why do we do it this way?" with no clear referent), make your best guess from conversation context (open files, recent edits, what was just discussed). State your interpretation briefly so the user can redirect if you're off, then proceed.

## Step 2. Establish the Code Anchor

Before spawning investigators, anchor the investigation in concrete code. You need:

- The relevant file path(s) and line range(s)
- The key symbols (function names, type names, constants)
- An initial commit list. The last few commits touching the target.
- ADR numbers, roadmap phases, journal dates and phase tags mentioned in those commit messages or in comments near the target

Build this inline.

```bash
# Blame target lines for last-touch commits
git blame -L <start>,<end> <file>

# Full file history, with patches, through renames
git log --follow -p -- <file>

# Last N commits touching the file
git log --oneline -20 -- <file>

# The full message of a commit
git log -1 --format=%B <commit>

# The phase tag, if any, that first contains a commit
git describe --contains --match 'phase-*' <commit>
```

Capture this as seed context (file paths, symbols, commits, ADR numbers, phases). Pass it to the investigators.

## Step 3. Spawn Parallel Investigators (default posture)

**Default to the full parallel investigation.**

Orbi has two evidence sources, and both are always available:

1. Source control history
2. Orbi records

Spawn both investigators at once so they run concurrently, in the background when the harness supports it. Don't ask one agent to cover both sources.

Spawn each investigator on the `why investigators` line, default the code model. Investigators read files and run git. They don't write anything.

Each investigator gets:
1. The base prompt from `references/investigator-prompt.md`
2. Its source playbook from `references/sources/` (see `references/source-playbook.md`)
3. The code anchor from Step 2 (file paths, symbols, commit hashes, ADR numbers, phases)
4. The user's original question

### Investigator roster

Each entry names the source and the kind of "why" it uniquely surfaces. Use it to know what to expect back and how to name a gap when a source returns empty.

1. **Source control investigator**. Git history, commit messages, code comments, tests. Best at surfacing *implementation-time rationale written down as the change landed*.

2. **Orbi records investigator**. ADRs, `docs/vision.md`, `docs/roadmap.md`, `docs/research/`, `journal/`, annotated phase tags, `CONTEXT.md`. Best at surfacing *the decision behind the code*. That means the options weighed, the criteria, the principle or phase scope that ruled alternatives out, and what would reopen it. `journal/` is local and gitignored, so it may be missing. The investigator still runs and reports the missing journal as a gap.

### When to skip an investigator

Don't skip either one by default. If your scope assessment suggests a single-commit trivial target where the commit message or one ADR already contains the complete answer, you may answer inline **only after** confirming the other source would be redundant. Say so explicitly in Sources Consulted. This should be rare.

## Step 4. Synthesize

Spawn one synthesizer subagent on the `why synthesizer` line, default the judgment model. Its quality check spot-verifies citations by reading files and running git. It writes nothing.

The synthesizer gets:
1. The investigator findings, including any null results and any gaps (such as a missing `journal/`)
2. The code anchor from Step 2 (file paths, symbols, commit hashes, ADR numbers, phases)
3. The user's original question
4. The epistemics framework from `references/epistemics.md`
5. The synthesizer prompt template from `references/synthesizer-prompt.md`

## Step 5. Present

Take the synthesizer's output and present it to the user. You may lightly edit for clarity or add context from the conversation, but **do not rewrite the confidence language**.

## Output Format

The output structure is the one in `references/synthesizer-prompt.md`: The Question, The Code in Question, What We Found, What We Can Reasonably Infer, Competing Hypotheses, What We Don't Know, Sources Consulted, Confidence Summary. Adapt as needed, but keep the confidence separation intact, and keep Sources Consulted as one line per investigator, including one that returned nothing or was skipped, with the reason.

After the Sources Consulted block, if the user's `why` question is a precursor to actually changing this code, convert the lineage findings into a Preserve / Change / Avoid / Risk constraint set suitable for planning the change. A change that would reverse an accepted ADR needs a new ADR through the `adr` skill first.

## Common Failure Modes to Avoid

- **Recency bias**. Assuming the most recent commit is authoritative. The current shape is often the accretion of many earlier decisions. Trace back.

## Reference Files

- `references/epistemics.md`. Confidence tiers and phrasing guide. The synthesizer must follow it.
- `references/investigator-prompt.md`. Base prompt template for investigator subagents.
- `references/source-playbook.md`. Index pointing at the two source playbooks below.
- `references/sources/code-archaeology.md` and `references/sources/orbi-records.md`. One self-contained playbook per source. Give each investigator the single file that matches its source.
- `references/synthesizer-prompt.md`. Prompt template for the synthesizer subagent, including the output format.
