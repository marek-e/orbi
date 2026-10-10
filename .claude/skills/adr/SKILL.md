---
name: adr
description: Write or update an Architecture Decision Record for Orbi, step by step with the user. Use when a decision is hard to reverse and has real alternatives (runtime, provider access, storage or message formats, the event contract, architecture-shaping dependencies), when converting an older ADR to the current format, or when the user asks for an ADR.
argument-hint: "[decision topic, or an existing ADR number]"
---

# Writing an ADR for Orbi

An ADR records one decision: the problem, the criteria, the options, how each option scores, what was chosen and what it commits the project to. The user decides. Your job is to frame the question, propose criteria and options, research, and score. Every step is validated by the user before the next one starts.

Read before starting:
- [template.md](template.md): the structure every ADR follows.
- `docs/adr/README.md`: the index, the status lifecycle and the existing decisions.
- `docs/vision.md`: Orbi's goals and principles. Criteria usually come from here.
- `CONTEXT.md`: the project's vocabulary.

## Step 0: does this deserve an ADR?

Write one only when all three hold:
- **Hard to reverse.** Changing your mind later costs real work.
- **Real alternatives.** At least two options a reasonable person could pick.
- **Not obvious.** A future reader would ask "why this?"

If one is missing, say so and suggest a journal note instead. One problem per ADR: if the topic hides two decisions, propose splitting it.

## Step 1: frame the question

1. Restate the decision as a question ("Which runtime runs Orbi?"), not as an answer ("Use Bun").
2. Draft the context (at most 10 lines): the problem, what exists today, and what forces the decision now. Name no candidate solution.
3. Pick the number: the highest in `docs/adr/` plus one, zero-padded to four digits. When converting or reopening a proposed ADR, keep its number.
4. Show the title and context to the user. Once they agree, create the file from the template with status `Proposed` and today's date.

## Step 2: criteria

Propose 3 to 5 criteria specific to this decision, each with the reason it matters for Orbi.

- A criterion names what is judged. Its reason explains why the project cares, usually by pointing at a goal or principle in `docs/vision.md`.
- No generic criteria ("performance", "ease of use") unless the reason ties them to Orbi.
- No criterion that is secretly an option ("supports Bun APIs").

The user validates, edits and orders them by priority. Write the criteria table.

## Step 3: options

Propose 3 to 5 options. Name concrete tools or approaches, not categories. Always include what is in place today, if anything. Add "do nothing" only when it's genuinely viable.

The user validates or edits the list. Write one short neutral subsection per option, and add the same options as empty rows in the evaluation table. The two lists must match.

## Step 4: gaps

Before researching, ask about anything that would change the scores: vetoes, must-haves, money, accounts the user has or doesn't have. Constraints go in the Constraints subsection of the context.

## Step 5: evaluate

Fill every cell: a score first, then `<br>`-separated bullets giving the reasons.

- Use the codebase for claims about Orbi, and link files with line numbers.
- Use primary sources (official docs, source code, the provider's own announcements) for claims about tools and policies. Link the claims that matter, not every sentence.
- Mark any claim you can't confirm with `[?]`.
- Keep all justifications inside the matrix. Don't add a second detailed table.

## Step 6: resolve the `[?]` marks

Show each uncertain claim to the user with the reason for the doubt. They confirm, correct or supply the fact. If a claim stays unconfirmed, write "unconfirmed" in the cell instead of guessing.

## Step 7: recommend, then let the user decide

Write the Decision section as a recommendation (at most 8 lines: the option, the two or three decisive reasons, the trade-off accepted). Ask the user to accept it, choose differently or add conditions.

Only on the user's explicit acceptance:
- Set the status to `Accepted` (or `Rejected`) with the date.
- Write Consequences and Revisit if.
- Update the index in `docs/adr/README.md`.
- If it supersedes an ADR, set the older one's status to `Superseded by ADR-NNNN` and link both ways.

Never mark an ADR accepted on your own judgment.

## Rules

- One step per exchange. Write to the file as you go, so an interrupted ADR is still readable.
- Changing an accepted decision means a new ADR that supersedes it, not an edit. Typos and broken links are the exception.
- Plain, short sentences. Use the vocabulary from `CONTEXT.md`.
- Use a structured question tool to ask the user when one is available. When a step has more than four items to validate, list them in the question text and ask for "looks right" or "change something".
