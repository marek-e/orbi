---
name: principle-experience-first
description: "Apply when experience or feature-scope tradeoffs come up. Choose a good experience over implementation convenience; ship fewer polished features over more rough ones."
disable-model-invocation: true
---

# Experience First

When implementation convenience conflicts with a good experience, choose the experience.

- Every feature, control, and option must be justified
- Ship less, ship better (polished experience with three features beats rough one with ten)
- Prototype before committing (design decisions are cheaper in a throwaway script than in `src/`)
- Get the details right (streaming output, approval prompts, Ctrl-C, error messages)
- Tighten the core loop (every feature should serve the central workflow or get out of the way)

Orbi isn't a product, so there is no end user to onboard. Its users are Marek, who uses it every day, and the readers of the article series, who clone a phase tag, run it, and read the code. The model is a user too. It reads every tool result and error message, so write those for it. Weigh each user's experience and explain impact from their side.

Foundations should serve the experience. Foundational thinking governs the *sequence* of work. This principle governs the *target*.
