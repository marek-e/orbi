### Authoring or modifying a skill

**You own the skill's voice.**

1. Use the harness's skill-authoring guidance when it has one (a skill-creator or writing-for-agents skill). Skills live in `.agents/skills/<name>/SKILL.md`.
2. Validate the skill:
   - Frontmatter has `name` and `description`.
   - Referenced files exist, and cross-skill links resolve.
   - It is harness-neutral. It describes actions ("spawn a subagent", "ask the user"), not one harness's tool names, so it works in Claude Code, Codex, and Orbi's own skill loader (Phase 6).
   - It uses the terms in `CONTEXT.md`. "Sbire" names Orbi's product feature. "Subagent" names a helper the harness running the skill spawns.
3. Test cases if structural. Skip if subjective.
4. Run **Committing** (`playbooks/committing.md`).

When in doubt, delete. Keep only prose that changes a decision. Tell it to do the thing and skip the reason. Explain only when the rule is confusing without one. Match tone to scope. Point at structural sources (types, READMEs, config) per the **encode-lessons-in-structure** principle skill. Delegate to other skills by path. Don't restate. A workflow you keep hitting but isn't captured → propose a new skill.

**Reply:** summary of the skill, key design decisions, validation notes.
