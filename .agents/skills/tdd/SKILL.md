---
name: tdd
description: "Use only when the user explicitly asks for TDD, a failing test, or a regression test, OR when the bug has an obvious cheap local test target. Skip when the test path is unclear, expensive, integration-heavy, or not requested."
disable-model-invocation: true
---

# TDD Bug Fix

When fixing a bug with a clear, cheap test path, make the broken behavior executable before changing production code. The goal is a focused regression test that fails before the fix and passes after it.

Do not force a test when it would be impractical. If the available test would require broad harness setup, brittle mocks, slow end-to-end infrastructure, a real model call, vague reproduction steps, or large unrelated fixture churn, skip adding a new test and use the closest useful verification instead.

## Tests in Orbi

- `bun test` is the runner. It finds `*.test.ts` files. Put each one next to the module it tests under `src/`, so `bun run typecheck` checks it too.
- No test suite exists yet. If you write the first test file, keep to what `bun test` provides, add no test dependency, and say in the commit message which conventions it sets, so Marek can object.
- A test calls the code the way its users do. The REPL and the future eval runner use `Agent`: they call `agent.prompt(text)` and read the `AgentEvent`s it yields. A test does the same and asserts on the collected events against a literal expected list (`text`, `tool_call`, `tool_result`, `notice`, `turn_end` with its `usage`).
- Fake the provider at the HTTP boundary, not inside Orbi. Start a local `node:http` server that answers with a recorded streaming response, and point the provider's base URL at it. Today's draft uses the Anthropic SDK, which reads `ANTHROPIC_BASE_URL` and needs some `ANTHROPIC_API_KEY`. The OpenAI Responses path (ADR 0006) gets the same kind of fake. Never mock `Agent`'s methods, the SDK client, or `runBash`.
- Approval is part of `AgentOptions`, so a test passes its own `approve`. `async () => false` exercises the refusal path without running anything.
- A `bash` tool test runs real commands in a temporary directory from `node:fs`'s `mkdtemp`, never in the repo.
- Apply the **principle-test-behavior-not-implementation** skill. If the test would still pass with every Orbi function returning `undefined`, the assertion is wrong.

## Workflow

1. **Understand the bug.** Identify the intended behavior, current behavior, affected path, and smallest observable reproduction.
2. **Choose the narrowest executable check.** Prefer the closest test already used for that codepath. For the loop, that is a turn against the fake provider. If no practical test path is obvious, do not create one from scratch just to satisfy the workflow.
3. **Write the failing test first.** Add the smallest focused test that would have caught the bug. The test should encode intended behavior, not mirror the current implementation.
4. **Run the new test before fixing.** Run `bun test <file>` and confirm it fails for the intended reason. If it passes or fails for an unrelated reason, correct the test or reproduction before editing the implementation.
5. **Fix the bug.** Make the smallest production change that satisfies the intended behavior while preserving nearby contracts. A fix that changes the `AgentEvent` types touches the event contract, which `AGENTS.md` says to discuss first (ADR 0005 is still proposed).
6. **Rerun the regression test.** Confirm the test now passes, then run `bun test` and `bun run typecheck`.

## If a Failing Test Is Impractical

Use the closest executable regression check instead: a targeted script, a manual reproduction in the REPL, a drive through the `verify-orbi` skill if it exists, or a focused integration check.

Prefer no new test over a bad test. A bad test is one that mostly tests mocks, encodes current implementation details, depends on timing or unrelated global state, calls the real model API, or would be deleted immediately after proving the fix.

## Guardrails

- Do not change tests merely to match a wrong implementation.
- Do not weaken existing assertions unless the expected behavior has genuinely changed and the reason is clear.
- Keep the regression test focused on the bug. Avoid broad fixture churn or unrelated coverage expansion.
- If the bug is flaky, make the test deterministic where possible and document the signal being locked down. A recorded provider response is deterministic. A live model is not.
- If the bug exposes a broader class of failures, first land the focused regression path, then consider additional sibling coverage.

## Final Response

Report the evidence, not just the outcome:

- Name the failing-before test or executable check and the failure it produced.
- Name the passing-after test run and any nearby validation performed.
- If failing-before evidence could not be demonstrated, state why and describe the closest regression check used instead.
