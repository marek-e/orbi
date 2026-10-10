---
name: typescript-best-practices
description: TypeScript best practices for Orbi. Use when reading or editing any .ts or .tsx file.
paths: ["**/*.ts", "**/*.tsx"]
disable-model-invocation: true
---

# TypeScript best practices

Apply the **principle-type-system-discipline** skill first.

Orbi runs on Bun and stays runnable on Node ([ADR 0002](../../../docs/adr/0002-runtime.md)). `tsconfig.json` is `strict` with `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, and `verbatimModuleSyntax`. The first four rules below come from those two sources and override anything else here.

| Rule | Summary |
|------|---------|
| Erasable syntax only | Write only TypeScript that Node can strip: no `enum`, no `namespace` or `module` with values, no constructor parameter properties (`constructor(private x: X)`), no `import x = require()`. Use string-literal unions and `as const` objects instead. ADR 0002 adds `erasableSyntaxOnly` to `tsconfig.json`. Until it's there, the compiler won't catch these. |
| `node:*` APIs only | Import platform APIs from `node:*` (`node:child_process`, `node:fs`, `node:http`, `node:readline`). No `Bun.spawn`, `Bun.serve`, `Bun.file`, or other `Bun.*` in `src/`. |
| Imports as Node reads them | Relative imports keep the `.ts` extension. Type-only imports use `import type` or an inline `type` modifier, because `verbatimModuleSyntax` keeps every other import at runtime. |
| Indexed access is partial | With `noUncheckedIndexedAccess`, `arr[i]` and `record[key]` are `T \| undefined`. Handle `undefined`, or change the type so the access is total. Never silence it with `!`. |
| Discriminated unions | Model variants with a `type` literal discriminant, as `AgentEvent` does, so impossible states can't be represented. No optional-field bags. |
| Branded types | Brand primitives with `& { readonly __brand: "X" }` so they can't be mixed up. Validate once at the boundary. |
| Constructive modeling | Build the shape so the illegal value can't be constructed. `[T, ...T[]]` for non-empty, `[T, T][]` for even length, `start` plus `duration` for a range. Not a runtime guard, not a wish for refinement types. |
| Simplest total type | Keep `T[]` while every operation on it stays total. Strengthen to `NonEmpty<T>` only where the loose type forces `!`, a cast, or a "should never happen" throw. |
| `unknown` over `any` | External data is `unknown`: model output, tool input, SSE payloads, files, environment variables. |
| Parse functions, not a schema library | Orbi has no runtime schema library. Adding one is a dependency choice to discuss first. Write one small parse function per boundary shape that returns the domain type or `null`, like `parseCommand` in `src/agent.ts`. |
| No `as` casts | Every `as` is a runtime crash waiting. Cast only after validation. |
| Narrowing hierarchy | Discriminant switch > `in` operator > `typeof`/`instanceof` > user-defined type guard > `as`. |
| Type guards | Must verify the claim. A lying guard is worse than `as` because the bug hides behind a name that says it's safe. Name them `isX` or `hasX`. |
| Exhaustiveness | Inline `const _exhaustive: never = x;` in default arms so the compiler errors when a new variant is added. Every switch over `AgentEvent["type"]` needs one. |
| `satisfies` over `as` | Validates the value without widening literal types. |
| Boundary validation | Parse where data crosses in, into a named domain type. `Record<string, unknown>` (however spelled) stops at that parse. Trust types inside. See the **principle-boundary-discipline** skill. |
| Derived types | Reach for `Extract`/`Pick`/`Omit`/`Parameters`/`ReturnType`/`Awaited`/`typeof` before declaring a new interface. |
| Object args | Pass objects, not positional, so argument order is self-documenting. Skip on hot paths (stream parsers, per-frame TUI render). |
| Real tests | Don't mock what you can run. Drive `Agent` and assert on its events, with a fake provider at the HTTP boundary. See the **tdd** skill. |
| The core never prints | Only the UI writes to the terminal (`src/cli.ts` today). The core reports through events, a `notice` for anything the user should see. No `console.*` or `process.stdout` outside the UI. |

Examples: `references/patterns.md`.
