### Prototype

**You own the design decision, not the code. The prototype is a throwaway instrument. The real build follows Feature.**

The one playbook where the Laziness Protocol's "smallest change" and the verification bar invert. Speed over polish, code quality does not matter, no planning. The rigor is in picking the right design cheaply. Propose variations the user didn't ask for, throw an approach away and try another.

1. Scope the decision the prototype exists to make: which output layout, which interaction, which density, or for an empirical fork which behavior, timing, or approach (what a provider's stream actually sends, how a tool result reads to the model). No decision means no prototype. Route to Feature.
2. Gather references when the design space is open. Look at prior art first: Pi, Codex, OpenCode, and what Claude Code sends and shows (the Phase 0 captures, once they exist). Summarize the options and let the user pick directions before building. Skip when the direction is set.
3. Build throwaway in an isolated scratch dir, outside `src/` and outside the repo when it can be. For a terminal-output decision, the smallest Bun script that prints the idea. For a behavioral or timing decision, the smallest script that exercises the question, such as a raw `fetch` to the API that logs each stream chunk. No production structure, no tests, no abstractions.
4. When comparing alternatives, build them behind one switch (a flag or a keypress), each variant labeled. This is the **exhaust-the-design-space** principle skill made cheap.
5. Verify by observing it. For a terminal-output decision, run each variant in a real terminal and capture its output (`script` records the session on macOS). For a behavioral or timing decision, observe the thing you are deciding by logging the timing or printing the output. The observation is the test here, not an assertion.
6. Present alternatives, tradeoffs, and a recommendation. The output is the decision plus the throwaway artifact, not code to commit. Hand the chosen direction to **Feature** (or `architect` for the shape) for the real build. If the decision is hard to reverse, the prototype's evidence goes into an ADR draft per `.claude/skills/adr/SKILL.md`.

**Reply:** the variants explored, the evidence (captured terminal output for an output decision, the observed output or timing for a behavioral one), tradeoffs, your recommendation, and the scratch path. Say plainly that the prototype is throwaway.
