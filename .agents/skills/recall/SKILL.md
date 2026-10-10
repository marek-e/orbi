---
name: recall
description: "Reconstruct your recent working context from your own session history, live state, and the project's record (commits, ADRs, journal, roadmap, phase tags), then hand back a tight current-state brief. Use for 'recall my work on X', 'catch me up', 'what have I been working on', 'where did I leave off', before starting or resuming work."
disable-model-invocation: true
---

# Recall

**Before you start or resume work, you rebuild the user's recent working context and hand back a tight capsule of where things stand now and what to do next.**

Keep it tight and on-topic. Read only what the in-scope threads need, then stop.

Your context lives in two records. Your own session history holds what you did and decided. The project's record holds everything that happened around the same code outside those sessions. That means the commits that landed and the ones that got reverted, the ADRs accepted or still proposed, the journal entries, and where the current roadmap phase stands. That second record is what the **why** skill searches, across source control and Orbi's records. A feature with a long tail of attempts keeps most of its story there, so don't reconstruct it from your transcripts alone.

Your session history is this project's session transcripts in the harness's store. Claude Code keeps them at `~/.claude/projects/<slug>/*.jsonl`, where `<slug>` is the absolute project path with each `/` turned into `-` (so `/Users/you/proj` becomes `-Users-you-proj`). Codex keeps them under `~/.codex/sessions/`, every project together, so keep only the sessions whose recorded working directory is this project. Each line is one record of the session. Never read other projects' transcripts. Orbi's own session log arrives in Phase 3.

1. Classify, then route. One specific prior session to resume is the `session-pickup` playbook, not this. Turning habits into a durable skill is `automate-me`. A human-readable summary of your work is a different task. Recall loads working context across recent sessions before you act. If the user already gave you a full state capsule (paths, the last commit, the change), use it and skip the mining.
2. Lock the scope before searching. Pin the window ("recent" is a real range, default the last 7 days), the topic if named, and the project (always the active one). State the scope back. Never quietly turn "all" into "recent N".
3. Fan out across your session history. Spawn parallel subagents on the code model, each taking a slice of the corpus. Tell every subagent to order candidates by real modification time (`ls -t`) and never by file name, grep the topic first and then read only the matching sessions and only their relevant regions, and skip the current session plus obvious noise (subagent, eval, and test sessions). Each returns the same schema, one block per session: topic, the user's goal, decisions, open threads, struggles and corrections, and artifacts (commits, ADRs, journal entries, files), each citing the session id. For one or two sessions, skip the fan-out and search directly. The raw transcripts stay in the subagents. The main thread gets only their findings.
4. Sweep the project's record whenever the topic names a feature, file, module, ADR, phase, or bug. This is the default, not a judgment call, and "my work on X" does not exempt it. Hand it to the **why** skill's two source investigators, but steer their question from "why was this built this way" to "what's the current state, what's been tried and didn't hold, and what's still open (proposed ADRs, unfinished roadmap items, open questions in the journal)". Reuse its source playbooks, run the investigators in parallel with the session-history mining, and inherit its posture: one investigator per source, null results are findings, a missing `journal/` is a gap to name. Fold what comes back into the brief. Skip this step only for pure activity recall with no named target ("what did I do this week"), where your own history and live state are the entire answer.
5. Verify against live state. Take the commits, uncommitted changes, ADR statuses, and tags that the mining and the sweep surfaced and check them with `git` (`git status`, `git log`, `git tag -n`) and the ADR's Status line. When the answer hinges on what an agent actually did (the tools it ran, files it read, errors it hit), read the full transcript, not just a trimmed local copy.
6. Write the brief to the contract below. Group by thread. Stay on the named topic.

## Output contract

Lead with the capsule, then the thread status, then the problems, then the next move. Deeper detail goes below or gets cut.

- **Capsule.** At most 5 bullets. What this work is and where it stands overall, including the current roadmap phase.
- **Threads.** One line each, prefixed with exactly one status tag: `[committed <sha>]`, `[tagged phase-N]`, `[verified, uncommitted]`, `[in flight, uncommitted]`, `[reverted <sha>]`, `[ADR NNNN proposed]`, or `[planned, not started]`. A thread with no tag is not done yet, so tag it.
- **Problems.** At most 5, the recurring ones. Include any fix that landed and was reverted, so the next attempt starts where the last one failed, and anything waiting on a proposed ADR.
- **Next move.** The single most useful next action, concrete.

An adjacent feature or roadmap item stays out unless it blocks this one. When the capsule and thread lines outgrow a screen, cut detail before you cut threads. Write the brief through the **unslop** skill, cite session findings by session id and project-record findings by their source (commit hash, ADR path, journal file, tag), and sanitize private context before any public output. The journal is local and private, and the repo is public.

**Reply:** the brief, to the contract above.
