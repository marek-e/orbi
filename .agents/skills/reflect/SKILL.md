---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

## When to invoke

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## Process

### 1. Locate the active transcript

The parent finds its own transcript file before fanning out. It lives with this project's session transcripts in the harness's store. Claude Code keeps them at `~/.claude/projects/<slug>/*.jsonl`, where `<slug>` is the absolute project path with each `/` turned into `-`, and puts a session's subagent transcripts in `<slug>/<session-id>/subagents/`. Codex keeps them under `~/.codex/sessions/`, every project together, so keep only the sessions whose recorded working directory is this project. Never read other projects' transcripts, and don't glob across every project in the store.

```bash
# Claude Code example: newest sessions of this project first
ls -t ~/.claude/projects/<slug>/*.jsonl 2>/dev/null | head -10
```

For each candidate, find its first user message and check that it contains the conversation's opening user prompt. Take the matching path. If no path resolves, or the harness keeps no transcript (Orbi's own session log arrives in Phase 3), write a tight digest of the session and pass that instead.

### 2. Spawn three reviewers in parallel

Spawn three reviewer subagents at once, in the background when the harness supports it, with models set as below. Reviewers read the transcript and may read files and run read-only git to look up context the transcript references. They write nothing.

Each reviewer and the synthesizer name a role line in `~/.agents/pstack-models.md` and a default role. Use that line's model when the file and the line exist. Otherwise use the default role's model. The **code model** is fast and capable, for routine work. The **judgment model** is the strongest available, for prose and judgment. A value of `auto` or `inherit-parent` means the subagent runs on the session's model. If the harness can't set a model per subagent, every spawn runs on the session's model. If the harness rejects a configured model, use the default and say so.

| Lens | Role line | Default model | Prompt template |
|---|---|---|---|
| Judgment | `reflect judgment, divergent, synthesizer` | judgment model | `references/judgment-reviewer.md` |
| Tooling | `reflect tooling` | code model | `references/tooling-reviewer.md` |
| Divergent | `reflect judgment, divergent, synthesizer` | judgment model | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in their final reply.

### 3. Synthesize

Spawn one synthesizer subagent on the `reflect judgment, divergent, synthesizer` line, default the judgment model. Its quality check includes spot-verifying citations by reading files and running read-only git. Use `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. The synthesizer returns a structured Accepted / Rejected / Backlog list.

### 4. Structural enforcement check

Sanity-check the synthesizer's Accepted list. For any item that would be enforced more reliably by a lint rule, script, metadata flag, or runtime check, move it from Accepted to Backlog. See the **encode-lessons-in-structure** principle skill.

### 5. Apply

Before applying any Accepted edit, present the synthesizer's full Accepted/Rejected/Backlog output to the user and wait for explicit approval. The user picks which subset to apply and may redirect routings. Skill changes affect every future agent working in this repo. Do not auto-apply.

Orbi has no backlog tracker. Add Backlog items to this session's journal entry in `journal/` when one exists, and list them in the summary either way. Only the Accepted list waits for approval.

For each approved Accepted item, follow the Routing field exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): parent does directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): run the `authoring-a-skill` playbook (`poteto-mode/playbooks/authoring-a-skill.md`).
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): run the `authoring-a-skill` playbook on the description alone, front-loading the trigger phrases the session missed.
- `new skill via authoring-a-skill: <kebab-name>`: hand creation to the `authoring-a-skill` playbook. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done. Skip this step if it doesn't.

### 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog noted: `<item>` (journal entry or summary only). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
