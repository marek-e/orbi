---
name: benchmark-checklist
description: "Vet a measurement (latency, requests or tokens per turn, cache hit rate, eval score) before you report or act on it: limiter, setup, limits, errors, repeatability, relevance, and whether the work happened. Use when you run a benchmark or report an improvement or regression you measured."
disable-model-invocation: true
---

# Benchmark checklist

Use this when you produce a number about Orbi: a commit's before and after, a regression claim, a hillclimb harness, or a choice between a library, a prompt, or a tool design. Orbi's numbers are latency per turn, requests per turn, tokens per turn (input, output, cached), the cache hit rate, and from Phase 7 eval scores. [Explain the Number](../principle-explain-the-number/SKILL.md) says why. Answer each question below with evidence from a run, not from a guess about the code.

For a quick ballpark the user asked for, one run is enough. Still check questions 4 and 7, and say that it is one run. Skip the rest unless that run looks wrong. A choice between options is never a ballpark.

## Before you run anything

- Write down the claim you expect to make, in the words you would ship ("the `edit` tool cuts the toy-repo fix from 9 requests to 5, median of 5 runs per side"). The questions test that sentence.
- Read the measurement script. Note what it times, what it counts, and what it ignores. Orbi's `turn_end` event carries the usage for a turn (requests, input, output and cache-read tokens). Prefer it over counting by hand.
- Check the load average with `uptime` and the core count with `sysctl -n hw.ncpu`. If the machine is busy, find out what is running. If you cannot stop it, interleave the sides so both see the same noise, and say so in the report.

## The questions

1. **Why not double?** Name the limiter. For a turn, it's usually one of three: time waiting on the model API (time to first token, then generation), time running tools (a slow command), or Orbi's own overhead (parsing the stream, rendering). Split the turn into those before you blame one. For Orbi's own code, profile in a run you do not report, because profilers slow the work down: Orbi stays runnable on Node, so `node --cpu-prof` works, and `sample <pid>` gives a stack sample on macOS. For requests and tokens, the limiter is what the model chose to do: read the transcript of the turn and count the requests it spent on each step. If a change did not move the number, the limiter explains why, so find it before you call the change useless.
2. **Was it set up the same?** Run every side the way you'd use it: the same model and reasoning effort, the same system prompt and tool set except for the change, the same repo state for the task, and the built `dist/orbi` or `bun start` on both. Cache state counts: a side that runs right after the other hits a warm prompt cache. Decide whether you measure cold or warm, and give both sides the same. If one side ran with a different model or effort, you compared configurations, not changes. Fix it and measure again before you pick a winner.
3. **Did it break limits?** Do the arithmetic. The cache hit rate can't exceed the share of the input that is an unchanged prefix (system prompt, tool schemas, earlier messages). Input tokens per request can't fall below the size of the system prompt plus the tool schemas. Compare the time saved with the time the changed piece took: removing a piece that takes 10% of the turn can make the turn at most about 11% faster. A result past a limit means the run measured something other than the work, such as a cached response, a turn that skipped the task, or a bug.
4. **Did it error?** Count failed requests, retries, rate-limit responses, tool calls that came back as errors, and turns that ended without doing the task. Errors behave differently from successes. A turn that gives up early uses fewer requests and tokens and looks like an improvement. Check that the task got done (the test passes, the file has the right content), not just that the turn ended. If the script does not count errors, add the count.
5. **Does it reproduce?** The model doesn't make the same choices twice, so requests and tokens vary from run to run even with nothing changed. Run each side at least 5 times, and alternate the sides (A, B, A, B, and so on) so cache warmth and API load don't favor one side. Report the median and the range. Treat a gap smaller than the run-to-run variation as no measurable difference. When the call is close, use a rank-sum test or the eval harness's own statistics.
6. **Does it matter?** Next to any micro result, measure the whole thing a user waits on: a full turn, or a full task like the Phase 1 failing-test fix. Report the micro result as a share of the whole. Shaving 50 ms off stream parsing in a turn that spends 20 s waiting on the model is 0.25%, however fast the parser gets.
7. **Did it even happen?** Confirm the work ran inside the timed region. The request reached the API (the usage shows it), the tool actually ran, the cache read is in the API's reported usage rather than assumed, and the eval task was scored on Orbi's real output. Lazy code (an async generator nobody iterates, a promise nobody awaits) and timeouts all produce numbers for work that never happened.

## Report

- Lead with the verdict: better, worse, no measurable difference, or inconclusive.
- Give the number with its unit, the run count, the range, and the limiter. For example, "requests per task 9 → 5, median of 5 runs per side, range 4 to 6 after, bound by the model re-reading files it had already seen."
- Call the verdict inconclusive when you claim a difference but cannot name the limiter, when the sides ran with different setups, or when you could not check questions 4 and 7. Name the gap.
- Keep a commit message to one primary number, per the **Committing** playbook. Put the runs, the range, and the limiter evidence in the journal entry or a notes file.

## How this fits the other perf material

- The **Perf issue** playbook finds and fixes slowness, and the performance mantras in its step 2 generate the fixes. This skill vets its baseline before the playbook plans from it, and every number after that.
- The **Hillclimb** playbook loops on one metric. This skill vets its harness before the harness is frozen. The frozen harness then prints error and work counts, so each keep-or-revert checks questions 4 and 7 for free.
