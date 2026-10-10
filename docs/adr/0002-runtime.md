# ADR-0002: Which runtime runs Orbi?

| | |
|---|---|
| **Status** | Accepted · 2026-10-10 |
| **Owner** | Marek Elmayan |
| **Supersedes** | – |
| **Superseded by** | – |
| **Related** | [ADR-0001](0001-language.md) (TypeScript), [ADR-0006](0006-model-access.md) (Sign in with ChatGPT), roadmap Phase 1 |

## Context

Orbi is a TypeScript CLI ([ADR-0001](0001-language.md)) that I'll start many times a day. It streams HTTPS responses, spawns shell commands, runs a short-lived local server for the Sign in with ChatGPT callback ([ADR-0006](0006-model-access.md)), and will later need a terminal UI (Phase 5) and a command sandbox (Phase 4).

The runtime decides whether TypeScript needs a build step, how long each start takes, how I and readers who clone the repo install and run Orbi, and which platform APIs the code may come to depend on.

Today a pre-decision draft runs on one runtime and uses one API specific to it. Nothing is built on it. Phase 1 can't start until this is decided.

### Constraints

- **Platforms:** macOS and Linux. Windows is not a goal.
- **Readers clone and run.** A reader installs one runtime once, clones a `phase-N` tag and runs it with one command. No prebuilt binaries are published. My own `orbi` command comes from a local build or launcher script.
- **No preference or veto** beyond the criteria.

## Criteria

| # | Criterion | Why it matters for Orbi |
|---|---|---|
| 1 | Compatibility with what Orbi will depend on: the OpenAI SDK and OAuth flow, the MCP SDK (Phase 6), a terminal UI library (Phase 5), child processes and signals (Phase 4) | Every runtime bug or missing API costs time spent on the runtime instead of on the agent, which is what I'm here to learn |
| 2 | Runs TypeScript as written, with no build step | From Phase 3 on, Orbi edits and reruns itself all day, and readers should run any `phase-N` tag with one command |
| 3 | Startup time | I'll start Orbi dozens of times a day. A slow start adds up and pushes me back to Claude Code |
| 4 | Installing and running it: a reader installs one runtime, then runs any tag with one command | The repo is public, and the README has to be enough. A single compiled binary is a convenience for my own PATH, not a requirement |
| 5 | Cost of switching runtimes later | This is the hard-to-reverse part of the decision. A cheap way out makes a wrong choice survivable |

Numbered by priority, 1 first. Raw performance is left out on purpose: Orbi waits on the network almost all the time.

## Options

### Bun, with Bun-specific APIs allowed

What's in place today: the draft uses `Bun.spawn`. Bun runs TypeScript directly and compiles a single binary with `bun build --compile`. The code uses Bun's own APIs wherever they're more convenient than Node's.

### Bun, with the code limited to Node's standard APIs

The same runtime and toolchain, but the source only uses `node:*` modules (`node:child_process`, `node:fs`, `node:http`), so it could also run on Node.

### Node.js 24 LTS

The version installed on my machine. It runs `.ts` files by stripping types, without a build step for TypeScript that only adds types. Distribution goes through npm, or through Node's single executable applications.

### Deno 2

Runs TypeScript directly, supports npm packages, compiles a binary with `deno compile`, and has a permission system (`--allow-run`, `--allow-net`, ...).

## Evaluation

| Option | 1. Compatibility | 2. No build step | 3. Startup time | 4. Install and run | 5. Cost of switching |
|---|---|---|---|---|---|
| **Bun, Bun APIs allowed** | 🟢🟢<br>- OpenAI SDK [lists Bun ≥ 1.0](https://github.com/openai/openai-node)<br>- MCP SDK v2 [runs on Bun](https://github.com/modelcontextprotocol/typescript-sdk)<br>- OpenTUI is built for Bun<br>- `node:child_process` is ["partially implemented"](https://bun.com/docs/runtime/nodejs-compat). Process-group kill [was fixed in 1.1.38](https://github.com/oven-sh/bun/issues/15791), but an [open macOS hang](https://github.com/oven-sh/bun/issues/42171) affects `Bun.spawn` with a terminal<br>- Ink [broke on Bun 1.2.0](https://github.com/oven-sh/bun/issues/16678). Claude Code ships Ink on Bun, so it works in practice | ✅<br>- Runs all TypeScript syntax and reads `tsconfig` | 🟢🟢🟢<br>- 30 ms for an empty file<br>- 53 ms importing an SDK, `child_process` and `readline` | 🟢🟢<br>- One install (script or Homebrew), then `bun install && bun start`<br>- Fewer readers already have it than Node<br>- `bun build --compile` gives me a binary for my PATH (64 MB for the draft) | 🟠<br>- Every `Bun.*` call (spawn, files, the OAuth callback server) needs rewriting to move away<br>- The count grows each phase. One call today |
| **Bun, Node APIs only** | 🟢🟢<br>- Same runtime, same facts<br>- A Bun gap can be worked around by running that part on Node, because the code is portable | ✅<br>- Same as above. To also run on Node unchanged, the code must avoid enums and parameter properties (`erasableSyntaxOnly`) | 🟢🟢🟢<br>- Same as above | 🟢🟢<br>- Same as above<br>- A reader with only Node could run it too, if the syntax stays erasable | 🟢🟢🟢<br>- `node:*` modules are what Node runs natively and what Deno [supports](https://docs.deno.com/runtime/reference/node_apis/)<br>- Switching means changing scripts and the lockfile |
| **Node.js 24 LTS** | 🟢🟢🟢<br>- The reference runtime: OpenAI SDK (Node 22/24), MCP SDK, Ink (["a Node.js process"](https://github.com/vadimdemedes/ink)), Pi's TUI (Node ≥ 22.19)<br>- Whether OpenTUI can be used from Node is unconfirmed | ⚠️<br>- Type stripping is [stable since 24.12](https://nodejs.org/docs/latest-v24.x/api/typescript.html) with no warning<br>- No enums, parameter properties or namespaces with code<br>- Imports need explicit `.ts`, and `tsconfig` is ignored | 🟢<br>- 94 ms for an empty file, 137 ms with the SDK import<br>- 227 ms on my machine as configured, because `NODE_USE_SYSTEM_CA=1` reads the keychain on every start | 🟢🟢🟢<br>- Most readers already have Node<br>- `npm install && npm start`<br>- Pi needs the same<br>- A binary for my PATH is clumsy: [single executables](https://nodejs.org/docs/latest-v24.x/api/single-executable-applications.html) are still in active development and CommonJS only. A launcher script works | 🟢🟢🟢<br>- `node:*` is the standard that Bun and Deno emulate |
| **Deno 2** | 🟢<br>- OpenAI SDK and MCP SDK list Deno<br>- [`node:child_process` fully supported](https://docs.deno.com/runtime/reference/node_apis/)<br>- No Ink support statement, [open `process.stdin` compatibility bugs](https://github.com/denoland/deno/issues/22371), no OpenTUI. The TUI is the risk | ✅<br>- Runs all TypeScript syntax | 🟢🟢<br>- 32 ms for an empty file<br>- 71 ms with the SDK import | 🟢<br>- Fewest readers already have it<br>- One install, then `deno task start`<br>- `deno compile` gives a binary | 🟢🟢<br>- Low if the code sticks to `node:*` imports<br>- `Deno.*` APIs, permissions flags and `deno.json` add lock-in |

Startup was measured on 2026-10-10 on my Mac (Apple Silicon): Bun 1.3.14, Node 24.15.0, Deno 2.9.7, median of 30 runs (20 for Node without system certificates). The SDK test imports `@anthropic-ai/sdk` as a stand-in for the OpenAI SDK. All three runtimes reach `api.openai.com` from my network.

## Decision

Bun, with the code limited to Node's standard APIs (`node:*`) and to TypeScript syntax that Node can strip (`erasableSyntaxOnly`), so the same source also runs on Node unchanged.

- It's the fastest to start (53 ms against 137 ms for Node) and runs TypeScript as written.
- Compatibility, criterion 1, is where Node is stronger. Keeping the code portable turns that into a safety net: if a Bun gap bites in Phase 4 (signals) or Phase 5 (TUI), that part, or all of Orbi, moves to Node by changing scripts.
- Pi already uses the reverse hybrid: Node as the runtime, `bun build --compile` for its binary.

Trade-off accepted: no `Bun.spawn`, `Bun.serve` or `Bun.file`, no enums or parameter properties, and the code must be checked on Node from time to time to stay portable. Node as the primary runtime is the close second: better compatibility and more readers already have it, but slower to start and with syntax limits.

## Consequences

- Bun runs Orbi, installs packages (`bun.lock`) and builds my local binary with `bun build --compile`.
- The source imports only `node:*` modules: `node:child_process` for commands, `node:http` for the Sign in with ChatGPT callback, `node:fs` for files.
- `tsconfig.json` gets `erasableSyntaxOnly`, so the compiler rejects enums and parameter properties. Imports keep explicit `.ts` extensions.
- Orbi needs a way to check it still runs on Node, such as a `start:node` script, run at least before tagging each phase.
- The pre-decision draft in `src/` breaks these rules (`Bun.spawn`, parameter properties). It gets replaced in Phase 1, not patched.

## Revisit if

- Orbi gets popular enough that people want to use it rather than read it. Then prebuilt binaries matter, and a Rust rewrite with a compiled binary becomes an option (which would also reopen [ADR-0001](0001-language.md)).
- A Bun bug blocks Phase 4 or Phase 5 with no workaround. Then Node becomes the primary runtime, which the portability rule makes cheap.
- Node's startup time gets close to Bun's. Compatibility would then favor Node.
- Bun's maintenance or license changes, now that Anthropic owns it.
