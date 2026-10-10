### Perf issue

**You own the measurement story. Plan, review, verify the numbers.** Tie every fix to a measurement, don't read source instead of measuring.

1. Capture a baseline on the surface where the slowness shows. Orbi is a Bun CLI, so pick the artifact that matches the complaint:
   - **A slow or janky turn.** Timestamp each event and request from an event consumer, never by making the core print. Record requests and tokens per turn, latency to the first event, and time to turn end. Most of a turn is usually spent waiting on the model API. Split that wait from Orbi's own time (startup, building the request, parsing the stream, running tool subprocesses) before you call anything slow.
   - **CPU in Orbi's own code.** `bun --cpu-prof src/cli.ts` writes a `.cpuprofile` on exit, and `--cpu-prof-md` writes a grep-friendly summary. The same entry runs under Node (`node --cpu-prof src/cli.ts`) when you want V8's profiler to cross-check (ADR 0002 keeps the code runnable there).
   - **Memory growth.** `bun --heap-prof` writes a `.heapsnapshot` on exit. Take two at different session lengths and diff them.
   - **Startup.** Time `dist/orbi` and `bun start` to the first prompt, median of N.
   Vet the baseline, and each later number, with the **benchmark-checklist** skill.
2. `how` to ground hypotheses. Don't claim a perf ceiling without running it first.
   Try the performance mantras in order, cheapest first:
   1. Don't do it. Stop work whose result nothing uses rather than cheapening it.
   2. Do it, but don't do it again.
   3. Do it less.
   4. Do it later.
   5. Do it when they're not looking.
   6. Do it concurrently.
   7. Do it cheaper.

   When an earlier mantra meets the target, stop.
3. Plan the fix from the measurement. If it crosses a function boundary, `architect` first. Delegate implementation to a subagent on your configured `perf-issue` model (the code model by default). Review the diff. Capture a post-fix artifact the same way as the baseline.
   Apply the **sequence-verifiable-units** principle skill, verifying each attempt before trying the next.
4. Parse and compare the artifacts (JSON to sqlite, diff). Explain the number per the **explain-the-number** principle skill. A token count that dropped because the model took a shorter path on one run is noise, not a fix. "Inconclusive" or wrong-surface is not a pass. Flag it.
5. Cite the measurement in the commit body, one primary number in `before → after` form.
6. Run **Committing** (`playbooks/committing.md`).

For sustained improvement against a metric rather than a one-off fix, use the Hillclimb playbook (`playbooks/hillclimb.md`).

**Reply:** baseline number, post-fix number, delta, artifact path.
