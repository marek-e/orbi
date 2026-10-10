### Trace forensics

**You own the diagnosis from the artifact. Load it, shape it, narrow to the cause, attribute to source.**

Distinct from **Runtime forensics**, which instruments the live process. Here the capture already exists. The artifact is a fixed dataset, read it, don't re-run it. The artifacts Orbi produces:

- A `.cpuprofile` from `bun --cpu-prof` or `node --cpu-prof` (V8 JSON), or its `--cpu-prof-md` summary.
- A `.heapsnapshot` from `bun --heap-prof` or Node.
- A macOS `sample` or spindump text report.
- A request and event log from a turn: each request with its token usage, each event with a timestamp. Once Phase 3 lands, the session log on disk is this artifact. The Phase 0 proxy captures of Claude Code are the same shape.

1. Identify the format and load it with the right tool. Parse large artifacts in a subagent (the **principle-guard-the-context-window** skill) and keep the reduced finding in the main thread.
2. Transform the raw artifact into a form you can query. Dump the profile, heap snapshot, or log into sqlite, one row per sample, frame, node, request, or event. Reach the queryable shape before you read.
3. Narrow to the cause. Query for the frames that hold the most time and walk the call tree to the hot path. For a leak, follow the retainer chain from the leaked object to a GC root. For a spindump, find the thread stuck on-CPU or blocked and its wait reason. For a request log, find the request whose tokens or latency jump, and what entered the context just before it.
4. Attribute to source. Map the hot frame to file, symbol, and line via the artifact's own symbols. A profile of `dist/orbi` may carry bundled names, so prefer one taken from `src/cli.ts`. A frame with no source mapping is not yet a diagnosis. Resolve the symbols, or say plainly the artifact does not carry them.
5. Confirm against a paired capture when you have one. Diff a before and after artifact. Without one, mark the finding as the strongest hypothesis the artifact supports, not a confirmed cause.
6. Hand back a cited diagnosis, no fix unless asked. Route to Bug fix or Perf issue once the cause is known. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only forensics`.

**Reply:** the artifact and format, the reduced finding, the source location, the artifact paths, and whether a paired capture confirmed it.
