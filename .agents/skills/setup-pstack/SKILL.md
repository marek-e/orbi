---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget. Detects the models the current harness can give a subagent and writes a config file that overrides the skill defaults. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

Write `~/.agents/pstack-models.md`, a plain config file that sets pstack's model per role. pstack skills read it at the start of a run when it exists. It lives in the home directory, not the repo, because the models a person can use depend on their account.

## Steps

### 1. Detect available models

List the model values you can pass when spawning a subagent in this harness. The harness's own tool schema is the dependable source. In Claude Code that is the agent tool's `model` field (`opus`, `sonnet`, `haiku`). Codex and other harnesses name models differently. If the harness has a models command or API listing the user's entitled models, prefer it for completeness. If you cannot detect any, ask the user to paste the values they have access to. Never write a value you have not confirmed is available. Respect any model the user's own global instructions forbid for subagents, and never offer it. The alias `inherit-parent` is always valid even though it is not a detected value. If the harness cannot choose a model per subagent at all, say so, write every role as `inherit-parent`, and skip to step 5.

### 2. Load current state

The default role-to-model mapping is the file shape shown in step 5 below. It is written in roles: the **judgment model** is the strongest model available (prose, judgment, the hardest code), the **code model** is fast and capable (routine code, exploration). If `~/.agents/pstack-models.md` already exists, read it and treat its `# budget` line and its role values as the current choices. Otherwise start from the defaults. A line whose role is not in step 5 is from a retired role. Drop it.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Ask the user, with a structured multiple-choice prompt if the harness has one. Offer these four options with these exact labels, and name the current budget when the file records one. With no file, say that `large` matches the skill defaults.

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) Apply it.** Map the judgment and code roles to detected models, then apply the budget. Where the harness sets reasoning effort per subagent or per model value, `unlimited`, `large`, `medium`, and `small` set it to `max`, `xhigh`, `high`, or `medium`, on the ladder `max` > `xhigh` > `high` > `medium` > `low`. If the harness encodes effort in the model value (e.g. `<model>-xhigh`), use the same family's detected value with the highest effort at or below the target, else mark the role as needing a choice. If the harness has no effort control, record the budget anyway and let it steer the model choice: `small` moves judgment roles to the code model, `unlimited` moves code roles to the judgment model. `inherit-parent` does not change. On a re-run, keep any role the user changed by hand.

**(c) Show the roles and confirm.** Show every role with its model, marking any value not in the detected set as needing a choice. Also list each line step 2 dropped. Ask whether to accept as-is or change specific roles, offering the detected models plus `inherit-parent` (this role runs on the session's model). For panel roles (arena runners, architect runners, interrogate reviewers) the value is a list, and one subagent runs per entry, alias entries included, so the list length sets the count. Panels want different model families. When the harness offers only one family, keep two entries anyway: each runs with an independent brief and no shared context. `arena cross-judge pool` is also a list, but Arena selects one value from it whose model family differs from the parent's when possible. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every real model value written must be in the detected set. `inherit-parent` always passes. If a chosen value is not available, stop and ask again.

### 5. Write the file

Write `~/.agents/pstack-models.md` with a `# budget` line with the chosen label and its target effort, a `# harness` line naming the harness the values were detected in, and one line per role, using the same labels poteto-mode uses. Overwrite the whole file so re-runs stay idempotent. Shape, with the role defaults in angle brackets:

```
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` as a value: the role runs on the session's model. Alias entries in a panel list still count toward its fan-out.
# harness: <harness name>
# budget: large (xhigh)
feature, refactoring: <code model>
bug-fix: <code model>
perf-issue: <code model>
hillclimb: <code model>
judgment and prose: <judgment model>
hardest tasks: <judgment model>
how explorer: <code model>
how explainer: <judgment model>
why investigators: <code model>
why synthesizer: <judgment model>
reflect tooling: <code model>
reflect judgment, divergent, synthesizer: <judgment model>
arena runners: <judgment model>, <code model>
arena cross-judge pool: <judgment model>, <code model>
swarm workers: <code model>
architect runners: <judgment model>, <code model>
interrogate reviewers: <judgment model>, <code model>
```

In Claude Code, for example, the judgment model is `opus` and the code model is `sonnet`.

If the user runs pstack in more than one harness, the values only fit the harness in the `# harness` line. A skill running elsewhere treats every role as `inherit-parent` and says so once.

### 6. Confirm

Tell the user the file was written and that skills read it when a run starts. Re-running this skill updates it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive Orbi's REPL for proof (a `verify-*` skill under `.agents/skills/`). If not, offer once: "want a project-local verification skill, so agents can drive the REPL the way you do and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill`. On no, move on without pushing.
