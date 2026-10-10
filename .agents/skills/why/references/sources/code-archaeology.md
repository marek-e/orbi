# Code Archaeology (git + in-repo)

## What this source contains

- Commit history (messages, dates, authors, diffs). Orbi commits straight to `main` without PRs, so the commit message is the whole review record.
- Inline code comments, TODOs, FIXMEs, deprecation notes
- Tests. Names and assertions often encode the edge cases that motivated a change
- Related files modified in the same commits (co-change signal)
- ADR numbers, journal dates and phase names mentioned in commit messages. These are leads for the Orbi records investigator, not this one.

ADRs, `docs/`, the journal and phase tags belong to the Orbi records source (`orbi-records.md`). Don't search them here.

The most trustworthy source, tied directly to the code, and the most complete. Everything that went through the repo should be here.

## How to search it

Expand the seed commit list:

```bash
# Full history of the file through renames
git log --follow --oneline -- <file>

# Pickaxe: commits that added or removed this exact text
git log -S '<exact_string_from_code>' -- <file>

# Or for patterns:
git log -G '<regex>' -- <file>

# Who wrote each line and when
git blame -L <start>,<end> <file>

# The full diff of a specific commit
git show <hash>

# Commits between two points affecting this file
git log <old>..<new> -p -- <file>
```

For each substantive commit, read the full message, not just the subject:

```bash
# The body is where the reasoning is, when there is any
git log -1 --format=%B <hash>
```

Look for in-code signals:

```bash
# TODOs and FIXMEs near the target
rg -n -C2 '(TODO|FIXME|HACK|XXX|NOTE)' <target_file>

# Related tests. Names often encode the "why"
rg -l '<symbol>' --glob '*test*'
```

## What good evidence looks like here

- A commit body that explains the problem being solved, not just the change ("Refuse ambiguous edits because the model retried the same wrong match")
- A sequence of commits that tried one approach, reverted it, and tried another
- An inline comment near the target line that explains a non-obvious constraint
- A test named `test_handles_edge_case_when_X` that reveals an edge case motivating the code
- A commit message that names the ADR or roadmap phase it implements

## Common pitfalls

- **Drafts that predate the decision.** Some code was written before the ADR that governs it (the Phase 1 draft in `src/` predates the provider decision). Its commits explain the draft, not the decision. Report the dates so the synthesizer can compare them with the ADR's.
- **Misleading commit messages.** "Small refactor" sometimes hides an intentional behavior change. Look at the diff, not the message.
- **Cargo-culted patterns.** The author may have copied a pattern without understanding why. Check if the pattern originated earlier in the codebase and investigate *that* commit.
- **Agent-written commit messages.** A coding agent's commit message can describe what changed in confident terms without the operator's reasoning. Treat it as a description of the change, and record the matching journal date under Additional Leads.
- **Treating code as evidence of intent.** The code itself isn't evidence for why it exists. Evidence comes from commit messages, comments, tests, and written records. Don't cite "the function is named X" as evidence of intent.

## What to return

Every commit or comment that bears on the question, with:
- The exact text (quoted)
- The hash or file:line
- Author and date
- Whether it's direct (explicitly addresses the question) or circumstantial
