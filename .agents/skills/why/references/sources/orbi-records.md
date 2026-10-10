# Orbi Records (ADRs, docs, journal, phase tags)

## What this source contains

- `docs/adr/`. One ADR per decision that is hard to reverse and has real alternatives. The header table holds the Status line (Proposed, Accepted, Rejected, or Superseded by ADR-NNNN, with a date), Supersedes, Superseded by, and Related. The body runs Context, Constraints, Criteria, Options, Evaluation (a scored matrix), Decision, Consequences, Revisit if. `docs/adr/README.md` indexes every ADR with its question, status and one-line decision, and explains the lifecycle. The process lives in `.claude/skills/adr/SKILL.md`.
- `docs/vision.md`. Why Orbi exists, who it's for, non-goals, principles, settled questions, open questions.
- `docs/roadmap.md`. The phases, each with its scope, "Decide first" items, status, "Done when" and planned article.
- `docs/research/`. Dated research notes with their sources. They record what was known on that date, usually the facts behind an ADR.
- `journal/`. One entry per work session, named `YYYY-MM-DD-<topic>.md`. First-person notes on what Marek wanted, what he found, what he decided and the knock-on effects. Gitignored and local only. It may not exist on another machine or in a fresh clone.
- Annotated phase tags (`phase-1`, `phase-2.1`). Each phase ends with one. The tag message summarizes what the phase delivered, and a later `.1` tag marks a fix after the phase's article went out.
- `CONTEXT.md`. Orbi's vocabulary (turn, request, event, sbire, mood), each term with the words to avoid.

The operator wrote these records to explain decisions, so they are the closest thing to stated intent. ADRs and journal entries are written when the decision is made. `vision.md` and `roadmap.md` get rewritten as plans change, so their current text is today's intent, not the intent at the time the code was written.

## How to search it

Start from the index and the target's vocabulary:

```bash
# Every ADR with its question, status and decision
cat docs/adr/README.md

# ADRs that mention the target
rg -n -i '<symbol_or_concept>' docs/adr/

# One ADR's status and links (header table)
sed -n '1,12p' docs/adr/<NNNN>-*.md

# What would reopen each decision
rg -n -A8 '^## Revisit if' docs/adr/

# The term as Orbi defines it
rg -n -i '<term>' CONTEXT.md
```

Follow decision chains. A rejected or superseded ADR points at the one that replaced it, and the replacement lists it under Related or Supersedes:

```bash
# Everything that links to ADR NNNN
rg -n 'ADR-<NNNN>|<NNNN>-' docs/ journal/ 2>/dev/null

# How an ADR changed over time (status flips, conversions to the current format)
git log --follow -p -- docs/adr/<NNNN>-*.md
```

For example, ADR 0003 (Anthropic's message format in the core) is Rejected, and ADR 0007 answers the same question with the full evaluation and scores 0003's option. Read both. The rejected one records what was tried and why it didn't hold.

Check the plan as it stood at the time:

```bash
rg -n -i '<concept>' docs/vision.md docs/roadmap.md docs/research/

# The roadmap and vision as they read when the target code landed
git log --oneline -- docs/roadmap.md docs/vision.md
git show <hash>:docs/roadmap.md
```

Read the journal, if it exists:

```bash
ls journal/ 2>/dev/null || echo "no journal/ on this machine"
rg -n -i '<concept>' journal/
```

Read the phase tags:

```bash
# Tag names with their full messages
git tag -n99 -l 'phase-*'

# One tag: message, date, and the commit it points at
git show --stat phase-<N>

# What a phase changed in the target file
git log --oneline phase-<N-1>..phase-<N> -- <file>
```

No tags yet means no phase has closed.

## What good evidence looks like here

- An accepted ADR whose Decision or Consequences section names the target or the constraint it enforces
- A rejected or superseded ADR next to its replacement, showing the alternative that was dropped and why
- A "Revisit if" bullet whose condition now holds. Report it as a signal that the decision may be due for review. Reopening it is Marek's call, through the `adr` skill.
- A journal entry from the session the code was written, especially its decision and knock-on sections
- A principle or non-goal in `vision.md` that rules out the obvious alternative (no agent frameworks, the core never prints, every side effect needs approval)
- A dated research note that an ADR cites for its facts
- A roadmap "Done when" or "Decide first" item, or a phase tag message, that scopes what the code had to do at that phase

## Common pitfalls

- **Proposed is not decided.** Nothing gets built on a proposed ADR. Code that disagrees with one is not a violation, and a proposed ADR is not evidence that the code was built for it.
- **Converted ADRs.** Some ADRs were decided before the current format and converted later. The Status line says so. Their criteria and options were confirmed at conversion, so the evaluation matrix is not a contemporary record of how the choice was made. The ADR's git history and the journal entry from the decision date are.
- **Living documents.** `vision.md` and `roadmap.md` show today's plan. Quote the version from the right date, and say which version you quoted.
- **Missing journal.** An absent `journal/` is a gap to report ("journal/ not present on this machine"), not evidence that nothing was written. When it exists, it is direct evidence of what Marek thought at the time, and an ADR written later may correct it. Record both if they disagree.
- **Research ages.** Research notes record policies and APIs that change. A note's date matters as much as its content.
- **Code that predates its decision.** Some code was written before the ADR that governs it (the Phase 1 draft in `src/` predates the provider decision). The roadmap status and the journal usually say so. Don't read a draft as the decision's implementation.

## What to return

Every record that bears on the question, with:
- The exact text (quoted)
- The path and section (`docs/adr/0007-message-format.md`, Decision), journal file, or tag name
- The date (ADR Status line, journal filename, research note date, tag date)
- For ADRs, the status and the Supersedes, Superseded by and Related links
- Whether it's direct (explicitly addresses the question) or circumstantial
- Whether `journal/` existed on this machine
