### Runtime forensics

**You own the diagnosis. Instrument the live process, don't theorize from source.** The deliverable is a cited diagnosis, not a fix.

1. Capture the live signal from the running Orbi process. A real artifact, not a guess.
   - **Spinning CPU.** `bun --cpu-prof src/cli.ts` (or `node --cpu-prof src/cli.ts`) and reproduce, then exit to write the `.cpuprofile`. For a process already spinning, `sample <pid>` gives macOS native stacks.
   - **Memory growth.** `bun --heap-prof` writes a `.heapsnapshot` on exit. Capture at two session lengths.
   - **A stalled or hung turn.** Timestamped events and requests from an event consumer, so you see the last event before the stall and whether a request is still open. `ps` and `lsof -p <pid>` show a tool subprocess that never exited or a pipe nobody reads.
   - **Garbled terminal output.** Record the raw session with `script` and read the bytes, escape sequences included.
2. Reduce the artifact to the smoking gun: the function on the hot path, the retainer chain from the leaked object to a GC root, the loop firing without input, the last event before the stall. Parse large artifacts in a subagent (the **guard-the-context-window** principle skill), keep the reduced finding in the main thread.
3. Prove the mechanism before believing it. Attach the inspector (`bun --inspect` or `node --inspect`) and evaluate in the running process, or add a temporary event consumer or debug line and rerun, to confirm the hypothesis cheaply. Never make the core print to find out.
4. Map the finding back to source: file, symbol, the line that allocates, schedules, or waits.
5. Throughput checkpoint stays one line: `throughput checkpoint: n/a, read-only forensics`.

**Reply:** the signal captured, the reduced finding, how you proved the mechanism, the source location, artifact paths. No fix unless asked. Hand back to Bug fix or Perf issue once the cause is known.
