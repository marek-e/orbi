### Feature

**You own the design. Plan, review, verify.** Delegate implementation. Stay in the lead.

1. `how` over the affected subsystem. Check the work belongs to the current roadmap phase (`docs/roadmap.md`). Work from a later phase waits.
2. `architect` for parallel design exploration. If the design makes a decision that is hard to reverse and has real alternatives (runtime, provider coupling, storage or session formats, the event contract, architecture-shaping dependencies), draft an ADR as `proposed` per `.claude/skills/adr/SKILL.md`. Build nothing on it until Marek accepts it. Keep building the parts that don't depend on it.
3. Write the throughput checkpoint as four todo items. A dimension that genuinely does not apply (single file, no fan-out) keeps its item with `n/a: <reason>` rather than being dropped:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target (the **separate-before-serializing-shared-state** principle skill). Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Delegate code-writing to a subagent on your configured `feature, refactoring` model (the code model by default) with a specific scope: file paths, success criteria, and the named data shape with its organizing structure per **principle-model-the-domain** (a state machine over scattered booleans, a table/registry over branching, a typed model over repeated shape assumptions), chosen before the delegate writes logic. In Orbi, new behavior the UI must see travels as a typed event, and the core never prints. When the implementation admits multiple valid shapes (error handling, abstraction layer, test structure), delegate via the **arena** skill instead so the runners surface the alternatives and the cross-judge guards the pick. Mandatory: no skip-with-reason escape, and Laziness Protocol does not override it (the gain is review separation, not lines saved). A subagent forbidden to spawn satisfies this by owning the diff directly with the same review separation. No "standing by" reply that waits on a nested agent. Comments per **Comments**. Surgical edits, re-ground against the source for upstream-derived files. Port shared-primitive improvements to all consumers and verify each. Commit liberally.
5. Verify on the matching surface: the REPL (`bun start`) driven with real input, and `dist/orbi` after `bun run build` when packaging could change behavior. Until Phase 4's sandbox exists, run turns that execute commands inside a throwaway repo, and approve only commands that stay inside it. "Inconclusive" or wrong-surface is not a pass. Flag it.
6. Reshape into small, ordered commits on `main` before anything is pushed. Queue follow-ups as later commits.
   Use the **sequence-verifiable-units** principle skill, building, verifying, and committing each small unit before the next.
7. If the design is contested, `interrogate` before committing.
8. Run **Committing** (`playbooks/committing.md`).

Code-coupled work (one feature, one migration) goes to a single owner with the checkpoint inline. That owner fans out internally after the blocking phase. Parent-level fan-out is for slices that produce independent artifacts (audits, cross-subsystem investigations, competing experiments). Rewrite the checkpoint at phase boundaries. Spawn a fresh owner rather than chaining interrupts.

**Reply:** what you built, what you chose and why, the throughput checkpoint, open decisions (including any ADR waiting on Marek). Tables for design alternatives.
