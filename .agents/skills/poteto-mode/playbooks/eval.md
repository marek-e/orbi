### Eval

**You own the experiment design. Plan, blind, run, synthesize.**

Two kinds of variant come through here.

- **Agent-facing prose.** A skill, playbook, or agent definition under `.agents/`. The candidates are subagents, and a blinded judge grades them.
- **Orbi's own behavior.** A change to Orbi's system prompt, a tool's schema or wording, or the loop. The candidate is Orbi itself, run on a fixed task. From Phase 7 on, the eval set and its headless runner decide (`docs/roadmap.md`), and a change counts as an improvement only if they say so. Until then, use the fixed toy task from Phase 1's **Done when**: a toy repo with one failing test that Orbi must fix. Freeze the repo state and the prompt for the whole experiment. If the toy repo does not exist yet, build it first, outside `src/`.

**Non-negotiables for blinding:**

- No `eval`, `test`, `judge`, `experiment`, `rubric`, `score`, `compare`, `benchmark`, `candidate`, or `arena` in any directory, file, or prompt the candidate sees. The toy repo's own failing test is the task, not a leak.
- The candidate prompt looks like an organic user request. State the goal, not the meta.
- No chain-eliciting cues. Don't ask the candidate to list which skills, principles, or files they applied. Ask for design notes generally and grade chain-following from code shape, not self-report.
- Sanitize directory and slug names. Use project-shaped names a user might pick.
- Don't tell the candidate other candidates exist.
- The judge can know it's judging but sees outputs by sanitized label only, never by model name or variant name.
- Comparing two variants: one judge scores both sets in a single pass on one scale, blind to which set each came from.

**Steps:**

1. **Frame.** State what variant is under test and what behavior counts as success. Write the rubric (3-6 concrete criteria) for the judge only. Hold it back from candidates. For an Orbi variant, the rubric also names the numbers each run records: task passed or not, requests per turn, input and output tokens, and latency to the first event. Read them from Orbi's event stream and request log, not from the transcript's prose.
2. **Set up sanitized environments.** Per-candidate working dir with the variant in place. Plant any context an organic task would have: a project skeleton, the skills the candidate would naturally read. For an Orbi variant, each run gets a fresh copy of the frozen toy repo. Until Phase 4's sandbox exists, every command Orbi runs touches the real machine, so approve only commands that stay inside that copy.
3. **Author one organic prompt.** What a user would type. No leakage of what's being measured.
4. **Spawn N parallel candidates** per the **arena** skill's Phase B. Each works in its own sanitized dir. Same prompt to each. Prose variants run on different models. Orbi variants run the same Orbi model N times per variant, because one run of a model says little. Interleave the variants' runs rather than running one batch after the other.
5. **Spawn one blinded judge** per the **arena** skill's Phase C, on a different model family when the harness offers one, otherwise the same model with an independent brief and no shared context. The judge sees outputs by sanitized label and the rubric, never a model or variant name. For an Orbi variant, the judge grades the diffs and transcripts, and the recorded numbers stand on their own.
6. **Verify the chain from transcripts, not self-report.** Read each candidate's transcript from this workspace's transcript store (the harness names its location). Never glob across other projects' transcripts. That reads private chats from unrelated work. Look at which files each candidate actually opened. Grade chain-following from the files it really read plus the shape of the code, never from the candidate's own claims. For an Orbi variant, the event log is the transcript.
7. **Read every candidate output yourself** end to end. Compare to the judge's verdict. Disagreement means a model is biased or the rubric is ambiguous. Explain any number you report per the **explain-the-number** principle skill. Synthesize.

**Reply:** variant under test, rubric, per-candidate notes, the recorded numbers per variant for an Orbi variant, judge's verdict, your synthesis, and a recommendation for whether to promote the variant.
