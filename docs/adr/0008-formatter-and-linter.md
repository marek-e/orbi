# ADR-0008: Which formatter and linter check Orbi's code?

| | |
|---|---|
| **Status** | Accepted · 2026-10-10 |
| **Owner** | Marek Elmayan |
| **Supersedes** | – |
| **Superseded by** | – |
| **Related** | [ADR-0001](0001-language.md) (TypeScript), [ADR-0002](0002-runtime.md) (Bun, code runnable on Node), roadmap Phase 1 |

## Context

Orbi has no formatter or linter. The pre-decision draft in `src/` (309 lines) is formatted by hand, and `tsc --noEmit` is the only check ([`package.json`](../../package.json)).

From Phase 1 on, models will write most of the code, and from Phase 3 Orbi writes it, with me reviewing. Consistent formatting keeps those diffs readable. Lint rules catch mistakes the compiler allows, such as promises that are never awaited and unused code.

The choice brings a config file, editor setup, a command the agent runs after each edit, and the style every file follows. Phase 1 replaces `src/`, so deciding now means the new code is formatted from the start and needs no reformatting commit later.

### Constraints

- **Editors:** VS Code and Zed. Both need format on save and inline diagnostics.
- **Where it runs:** CI (GitHub Actions) on push. No pre-commit hook and no agent hook for now.
- **No veto** beyond the criteria.

## Criteria

| # | Criterion | Why it matters for Orbi |
|---|---|---|
| 1 | Catches the async and type mistakes `tsc` misses, on TypeScript 7 | The agent loop is async from end to end (streaming, tool calls, cancellation in Phase 4). A promise that is never awaited or handled is a bug the compiler doesn't catch and a model often writes. Checks that need type information must work with the TypeScript 7 compiler Orbi uses |
| 2 | Speed on the whole repo | CI runs it on every push, and models run it while they work on Orbi. A slow check slows both |
| 3 | Setup to read: dependencies and config files | "Small enough to read in an afternoon" ([vision](../vision.md)). The tooling shouldn't be bigger than the code it checks |
| 4 | Fits the editor and the agent | Format on save while I review, automatic fixes from the command line, and messages a model can act on without me stepping in |

Numbered by priority, 1 first. The evaluation columns follow this order.

## Options

### `tsc` only

What's in place today: strict compiler settings ([`tsconfig.json`](../../tsconfig.json)) and no other tool. Formatting is left to each editor or model.

### ESLint + typescript-eslint + Prettier

The standard stack. ESLint lints, with typescript-eslint's type-aware rules. Prettier formats.

### Biome

One Rust binary that formats and lints. Its type-aware rules use Biome's own type inference, not the TypeScript compiler.

### Oxlint + Oxfmt

The Oxc toolchain, written in Rust. Oxlint lints and gets its type-aware rules through `tsgolint`, which is built on the TypeScript 7 compiler. Oxfmt formats.

## Evaluation

| Option | 1. Async and type mistakes | 2. Speed | 3. Setup to read | 4. Editor and agent |
|---|---|---|---|---|
| **`tsc` only** | 🔴<br>- Catches 1 of 6 planted bugs: a Promise used as a condition (TS2801)<br>- Misses the floating promise, the `async` `forEach` callback and `await 5`<br>- Turning on `noUnusedLocals` adds the unused import and variable (3 of 6), with no hits in today's code | 🟢🟢🟢<br>- `tsc --noEmit` on TypeScript 7: 120–131 ms | 🟢🟢🟢<br>- Nothing to add beyond [`tsconfig.json`](../../tsconfig.json#L11)<br>- Nothing enforces formatting | 🟠<br>- Diagnostics come from each editor's TypeScript language server<br>- No formatter and no autofix |
| **ESLint + typescript-eslint + Prettier** | 🟢<br>- Catches 6 of 6 with `recommendedTypeChecked`<br>- Does not support TypeScript 7: it throws `typescript-eslint does not support TS 7.0` at load time. Its [supported range](https://typescript-eslint.io/users/dependency-versions) stops below 6.1, because TS 7.0 [ships no API](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0)<br>- Works with TypeScript 6 installed next to 7 ([`package.json`](../../package.json#L21) gains a second `typescript`). Microsoft's recommended aliases break under Bun 1.3.14 ([oven-sh/bun#33834](https://github.com/oven-sh/bun/issues/33834)). A plain `npm:typescript@6.0.3` alias works<br>- TS 7.1 support is [in progress](https://github.com/typescript-eslint/typescript-eslint/issues/10940), with no date | 🟢<br>- ESLint 1.16 s, Prettier 0.23 s, with `tsc` 1.45 s: about 12× `tsc` alone<br>- ESLint uses the TypeScript 6 checker, so it gains nothing from TS 7<br>- Fine for a CI run | 🟠<br>- 4 new devDependencies, plus `typescript` pointed at 6.x<br>- Installed packages go from 32 to 130, and `node_modules` from 60 MB to 116 MB<br>- 2 config files, 7 lines in all<br>- Scripts must call the TS 7 `tsc` by path, since both versions ship a `tsc` binary | 🟢🟢<br>- VS Code: official ESLint and Prettier extensions, fix and format on save<br>- Zed: [ESLint and Prettier built in](https://zed.dev/docs/languages/typescript). Format on save is off by default<br>- `prettier --write` formats. `eslint --fix` fixes none of the promise rules, which only offer editor suggestions |
| **Biome** | 🟠<br>- Catches 6 of 6 planted bugs<br>- Misses 3 of 7 floating promises whose types come from `node_modules`: `readFile` from `node:fs`, an SDK call and `Bun.write`. Those are the calls Orbi makes. Biome [says](https://biomejs.dev/blog/biome-v2/) it covers about 75% of typescript-eslint's cases<br>- Uses its own type inference, not the TypeScript compiler<br>- The promise rules are [nursery](https://biomejs.dev/linter/rules/no-floating-promises/) in 2.5.15, so their behavior can change at any time | 🟢🟢🟢<br>- `biome check` (format and lint): 259 ms<br>- `tsc --noEmit` still runs separately | 🟢🟢🟢<br>- 1 devDependency, 2 installed packages, +58 MB (one native binary)<br>- 1 config file, 14 lines<br>- `biome init` defaults to tabs | 🟢🟢<br>- VS Code: [official extension](https://biomejs.dev/reference/vscode/) with inline diagnostics, format on save and safe fixes on save (`source.fixAll.biome`)<br>- Zed: [official extension](https://biomejs.dev/reference/zed/) runs Biome as a language server from the local binary, with diagnostics and fixes on format<br>- `biome check --write` formats. The promise fixes need `--unsafe`<br>- The default reporter prints a code frame per finding (387 lines for the fixture). `--reporter=concise` gives one line per finding |
| **Oxlint + Oxfmt** | 🟢🟢🟢<br>- Catches 6 of 6 planted bugs and 7 of 7 floating promises, including the `node_modules` ones<br>- Type-aware linting is [stable since 2026-07-22](https://oxc.rs/blog/2026-07-22-type-aware-linting-stable) and covers 59 of typescript-eslint's 61 type-aware rules<br>- `tsgolint` 7.0.2003 bundles TypeScript 7.0.2 and reads `tsconfig.json`<br>- `--type-check` also reports compiler errors, so one command could replace `tsc --noEmit` | 🟢🟢<br>- `oxfmt --check` then `oxlint --type-aware`: 576 ms<br>- Fine for a CI run | 🟢🟢<br>- 3 devDependencies, 7 installed packages, +51 MB<br>- 1 config file, 8 lines. The formatter runs without one<br>- Without a `.gitignore`, Oxlint lints `node_modules`. Orbi has one | 🟢🟢🟢<br>- VS Code: official [`oxc.oxc-vscode`](https://oxc.rs/docs/guide/usage/formatter/editors) for lint and format on save<br>- Zed: official [`oxc-zed`](https://github.com/oxc-project/oxc-zed) runs both tools as language servers. It ignores binaries installed through Nix or mise (issue #234)<br>- `oxlint --fix` and `oxfmt` fix from the command line<br>- One-line [`agent` output format](https://oxc.rs/docs/guide/usage/linter/output-formats.html). It switched on by itself under Claude Code: observed, not documented<br>- Oxfmt is [beta](https://oxc.rs/blog/2026-02-24-oxfmt-beta) (0.72) and passes Prettier's JS/TS conformance tests |

Measured on 2026-10-10 on an Apple M2 Pro, median of 7 to 15 runs: TypeScript 7.0.2 (and 6.0.3 for typescript-eslint), ESLint 10.12.0, typescript-eslint 8.71.1, Prettier 3.9.9, Biome 2.5.15, Oxlint 1.87.0, Oxfmt 0.72.0, oxlint-tsgolint 7.0.2003, Bun 1.3.14. The planted bugs were a floating promise, an `async` callback to `forEach`, a Promise used as a condition, an unused variable, an unused import and `await 5`. A second file had seven floating promises from different sources. On ~300 lines, Node's startup dominates every timing. With default line widths (80 for Prettier and Biome, 100 for Oxfmt), every formatter would rewrap today's `src/`.

Scale, strictly ordered: 🟢🟢🟢 strong · 🟢🟢 good · 🟢 acceptable · 🟠 weak · 🔴 fails. For yes/no criteria: ✅ yes · ⚠️ partly · ❌ no. A claim marked `[?]` is not yet confirmed.

## Decision

Oxlint with type-aware rules, and Oxfmt.

- It's the only option that caught every floating promise, including those from `node:fs` and the SDK, which make up most of the calls Orbi makes. It does this on the TypeScript 7 compiler Orbi already uses, not on a second copy of TypeScript.
- The setup stays small: 3 packages and one 8-line config file. `--type-check` could also absorb `tsc --noEmit`.

Trade-off accepted: Oxfmt is still beta, so its formatting may change between 0.x versions. The check takes 576 ms against 259 ms for Biome. ESLint + typescript-eslint is the close second once it supports TypeScript 7.1. Today it needs TypeScript 6 installed alongside.

## Consequences

- `oxlint`, `oxlint-tsgolint` and `oxfmt` become devDependencies. Oxfmt is pinned to an exact version while it's 0.x, so an upgrade never reformats code by surprise.
- One `.oxlintrc.json` turns on type-aware linting and at least `no-floating-promises`, `no-misused-promises` and `await-thenable`. Oxfmt runs on its defaults (100-character lines) unless a rule earns a config file.
- `package.json` gets `lint` and `format` scripts, and the Commands section of `AGENTS.md` lists them, so models run them while they work.
- A GitHub Actions workflow runs `oxfmt --check`, `oxlint` and the typecheck on every push. Orbi has no CI yet, so this is new work.
- `tsc --noEmit` stays the typecheck for now. Replacing it with `oxlint --type-check` is an easy-to-reverse choice for later.
- Tooling goes in before the Phase 1 code, so the new `src/` is formatted from its first commit. The draft gets replaced, not reformatted.
- In the editors: `oxc.oxc-vscode` in VS Code and `oxc-zed` in Zed, with format on save.

## Revisit if

- typescript-eslint supports TypeScript 7.1, and Oxlint misses a real bug that typescript-eslint would have caught.
- Oxfmt stays in beta for a long time, or a 0.x upgrade rewrites large parts of the code.
- Biome's promise rules leave nursery and catch types from `node_modules`. Biome would then be the lighter, faster choice.
- The Oxc project's maintenance or funding changes.
