# Prompts worth copying

Swap in the real paths, skills, and done checks. Informal wording works.

## Understand

- `/poteto-mode read <thread>. restate the underlying issue in your own words, in plain english.`
- `/poteto-mode investigate why <symptom>. give me what we know, what data you used, and your best hypotheses. don't change any code yet.`
- `use /how to understand <subsystem>. then use /why to find out why it broke recently.`
- `/recall my work on <topic> from last week, then read <issue>.`
- `/teach me why you implemented it this way and not <other way>. what did you trade off?`
- `/poteto-mode take over this branch. read the decision log, find what's done, and continue. don't redo finished work.`

## Build

- Bug: `/poteto-mode <symptom>. repro first, then fix and verify.`
- Bug in the REPL: `/poteto-mode repro this with /verify-orbi. if it repros on main, fix it and show me the session transcript as proof.`
- Bug with a cheap test: `/poteto-mode repro <bug> first. if there's a cheap test path, /tdd it. then fix and rerun.`
- Feature: `/poteto-mode add <behavior>. the event stream for <existing prompt> stays identical. verify both in the REPL.`
- Refactor: `/poteto-mode move <code> into one module, zero behavior change. record the current output first and prove it's unchanged after.`
- Cost: `/poteto-mode the phase 1 toy task takes <n> requests and <k> tokens. find what drives it, cut it, show me before and after.`

## Design and plan

- `/poteto-mode prototype a few options for <feature>. show me each one running in the REPL so i can compare.`
- `/poteto-mode we need <feature>. /architect it first, and answer open questions with prototypes. let me review before proceeding.`
- `/poteto-mode explore the options for <hard-to-reverse choice>, then /adr it. don't build on it until i accept.`
- `ask /arena for a second opinion on this thread and our approach.`
- `/poteto-mode turn phase <n> of the roadmap into a plan. small verifiable commits, each with its own verification steps.`
- `/poteto-mode plan the move of the loop from <old provider> to <new provider>. small verifiable commits. the event stream must match the original exactly, bugs included.`

## Review and commit

- `/interrogate the whole branch, but skeptically. don't change anything yet. no nitpicks unless it's a real bug or regression.` Read the dismissals too.
- `/swarm check every tool under src/tools against the approval rule. one worker per tool. one report.`
- `/poteto-mode commit this. small ordered commits, evidence in each message.`
- `/poteto-mode wrap up phase <n>. draft the journal entry and the tag message. i'll tag and push.`

## Away and back

- `/poteto-mode im going to bed. <goal> in a fresh worktree off <base>. done means <checks>. keep a decision log. don't ask me before committing. /loop until done. if you're truly stuck after a few hours, stop and write up why.`
- `/show-me-your-work catch me up on what you did last night.` Read its Attention section first.
- `/reflect capture what we learned so the next run doesn't repeat it.` Approve only edits that change a future decision.
- `/bro` restates the last reply in plain words.
