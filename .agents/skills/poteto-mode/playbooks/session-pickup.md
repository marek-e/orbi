### Session pickup

**You own the resume point. Read the prior trail, don't redo it.**

1. Locate the prior trail. A transcript in this workspace's transcript store (the harness names its location; never glob across other projects' transcripts, which reads private chats from unrelated work), the local commits not yet pushed (`git log origin/main..HEAD`), a `wip:` commit and the resume note its body names, a show-me-your-work trail, and the latest entry in `journal/`. Read the metadata overview and last messages first, then scan back for the decision points. Parse a long transcript in a subagent and keep the reduced timeline in the main thread (the **principle-guard-the-context-window** skill).
2. Reconstruct operational state. Any worktrees, what already landed (`git log`, `git diff` against the last pushed commit), the open todos, the decisions made, and any ADR still `proposed`. The prior trail is authoritative input. Resist the bias to re-derive it.
3. Diff done vs pending. Compare what landed against what was planned, name the resume point, do not re-run the prior repro or redo completed work. A "let me verify from scratch" pass means you're treating the trail as untrustworthy when it's authoritative.
4. Route the remaining work to the matching playbook and pick the verdict: continue the execution, deliver a finished recommendation, ratify or override a prior conclusion, or postmortem a failed run. The pickup playbook ends here. The routed playbook owns the rest.
5. Verify the inherited claims against the original goal on the real artifact (the **principle-prove-it-works** skill). A passing prior self-report is not the proof.

**Reply:** where the prior agent stopped, what you inherited vs redid (ideally nothing redone), the resume point, and the outcome.
