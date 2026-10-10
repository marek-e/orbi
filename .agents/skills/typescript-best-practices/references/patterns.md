# TypeScript patterns

Code examples for each rule in `SKILL.md`. The underlying principles are language-agnostic. See the **principle-type-system-discipline** and **principle-boundary-discipline** skills.

## Erasable syntax only

Node runs `.ts` files by stripping the types. Anything that generates JavaScript can't be stripped, so it's out ([ADR 0002](../../../../docs/adr/0002-runtime.md)).

```ts
// Don't: an enum emits an object
enum Effort {
  Low = "low",
  High = "high",
}

// Do: a union for the type, an `as const` array when code needs the values
const EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
type Effort = (typeof EFFORTS)[number];
```

```ts
// Don't: a parameter property emits an assignment
class Agent {
  constructor(private options: AgentOptions) {}
}

// Do: declare the field and assign it
class Agent {
  private options: AgentOptions;

  constructor(options: AgentOptions) {
    this.options = options;
  }
}
```

The Phase 1 draft's `Agent` still uses a parameter property. It gets replaced, not copied.

## `node:*` APIs only

```ts
// Don't: runs on Bun only
const proc = Bun.spawn(["bash", "-c", command], { cwd, stdout: "pipe" });

// Do: runs on Bun and Node
import { spawn } from "node:child_process";

const proc = spawn("bash", ["-c", command], { cwd, stdio: ["ignore", "pipe", "pipe"] });
```

The same goes for `node:http` instead of `Bun.serve` (the Sign in with ChatGPT callback) and `node:fs` instead of `Bun.file`.

## Imports as Node reads them

```ts
import { systemPrompt } from "./prompt.ts"; // keep the .ts extension
import { Agent, type AgentEvent } from "./agent.ts"; // inline `type` for type-only names
import type { BashResult } from "./tools/bash.ts"; // whole import erased
```

## Indexed access is partial

```ts
const lines = output.split("\n");

// Don't
const first = lines[0]!;

// Do: handle the missing case
const first = lines[0] ?? "";
```

When the access can never miss, change the type instead (see Simplest total type).

## Branded types

Brand primitives so they can't be mixed up. Validate once at the boundary. Downstream code trusts the type.

```ts
type ToolCallId = string & { readonly __brand: "ToolCallId" };

function parseToolCallId(input: unknown): ToolCallId | null {
  return typeof input === "string" && input !== "" ? (input as ToolCallId) : null;
}

function resultFor(id: ToolCallId, output: string): ToolResult {
  /* id is trusted */
}
```

Match the `readonly __brand: "X"` shape. Don't invent a new convention.

## Discriminated unions

Model variants with a literal discriminant. Every variant shares the field name and each variant's value is unique, so impossible combos can't be represented.

```ts
// Don't. Optionals let contradictory states exist.
type Auth = { signedIn: boolean; accessToken?: string; refreshToken?: string };

// Do. Only valid states exist.
type Auth =
  | { type: "signed_out" }
  | { type: "signed_in"; accessToken: string; refreshToken: string; expiresAt: number }
  | { type: "expired"; refreshToken: string };
```

Orbi's discriminant is `type`, as in `AgentEvent`. Use it everywhere.

## Constructive modeling

Build the type from parts that are all legal instead of restricting a loose type with runtime checks.

Non-empty, via a variadic tuple:

```ts
type NonEmpty<T> = [T, ...T[]];

// Don't: T[] plus a length check every caller must repeat
function firstTurn(turns: Turn[]): Turn {
  const first = turns[0];
  if (first === undefined) throw new Error("no turns");
  return first;
}

// Do: an empty value of the type can't exist
function firstTurn(turns: NonEmpty<Turn>): Turn {
  return turns[0];
}
```

Where a plain `T[]` arrives, narrow once with a guard. The fact then travels in the type:

```ts
const isNonEmpty = <T>(arr: T[]): arr is NonEmpty<T> => arr.length > 0;
```

Even length, as pairs:

```ts
type Pairs<T> = [T, T][];
```

A time range, as start plus duration:

```ts
// Don't: a comment holds the invariant
type TimeRange = { start: Date; end: Date }; // start <= end

// Do: a negative range can't be written; derive end when needed
type TimeRange = { start: Date; durationMs: number };
```

Keep `durationMs` a plain number. Brand it (per Branded types) only if a raw number could be passed where a duration is expected, not by reflex. Pick the representation that makes the bad state unconstructable, then expose the reading you need on top (`pairs.flat()`, a `rangeEnd()` helper).

## Simplest total type

Don't strengthen everything. Keep `T[]` when every operation on it is total:

```ts
const totalOutput = (usages: Usage[]) => usages.reduce((sum, u) => sum + u.outputTokens, 0); // [] is 0, fine
```

Strengthen when the loose type forces a lie at a use site. The tells are `!`, `arr[0] as T`, and a "should never happen" throw:

```ts
// Don't: partiality smuggled past the compiler
function newestSession(sessions: Session[]): Session {
  return sessions.at(0)!;
}

// Do: strengthen the input; the assertion disappears
function newestSession(sessions: NonEmpty<Session>): Session {
  return sessions[0];
}
```

Weakening the result to `Session | undefined` is the other total signature.

## `unknown` over `any`

External data is always `unknown`. Narrow before use.

```ts
// Don't
function handle(input: any) {
  return input.command.trim();
}

// Do
function handle(input: unknown) {
  if (typeof input === "object" && input !== null && "command" in input && typeof input.command === "string") {
    // narrowed; compiler verifies access
  }
}
```

External sources in Orbi: tool input from the model, streamed API events, `JSON.parse`, files, the session log (Phase 3), the token store, environment variables.

## Parse functions, not a schema library

Orbi has no runtime schema library, and adding one shapes the codebase, so it gets discussed first. Write one parse function per boundary shape. It takes `unknown` and returns the domain type or `null`, and the caller decides what a `null` means.

```ts
// Adapted from src/agent.ts: the model's tool input becomes a command or nothing
function parseCommand(call: ToolUseBlock): string | null {
  if (call.name !== bashTool.name) return null;
  const input = call.input as { command?: unknown } | null;
  return typeof input?.command === "string" && input.command.trim() !== "" ? input.command : null;
}
```

The `as` above only widens to optional `unknown` fields, so it can't lie. Every field is still checked before use.

## No `as` casts

Every `as` is a potential runtime crash. Cast only after the type system has verified the claim.

```ts
// Don't: from the Phase 1 draft of src/cli.ts. ORBI_EFFORT=fast type-checks and reaches the API.
const effort = (process.env.ORBI_EFFORT ?? "high") as Effort;

// Do
const isEffort = (value: string): value is Effort => (EFFORTS as readonly string[]).includes(value);

function parseEffort(value: string | undefined): Effort {
  if (value === undefined) return "high";
  if (!isEffort(value)) throw new Error(`ORBI_EFFORT must be one of ${EFFORTS.join(", ")}, got ${value}`);
  return value;
}
```

When refactoring an `as` out of existing code, identify why TypeScript can't infer:

- Missing discriminant: add one, switch to a discriminated union.
- Overly wide source type (e.g. `Record<string, unknown>`): narrow it.
- Untyped boundary: write the parse function for that shape.
- Genuinely inexpressible: use a branded type or `satisfies`.

## Narrowing hierarchy

From best to last-resort:

1. **Discriminated union switch / if.** Compiler narrows automatically.
2. **`in` operator.** `"key" in obj` narrows to variants containing that key.
3. **`typeof` / `instanceof`.** For primitives and class instances.
4. **User-defined type guard.** When the above aren't enough.
5. **`as` cast.** Only after validation.

```ts
function describe(event: AgentEvent): string {
  if ("delta" in event) return event.delta; // narrowed to thinking or text
  return event.type;
}
```

## Type guards

A guard must actually verify the claim. A lying guard is worse than `as`.

```ts
function isToolCall(event: AgentEvent): event is Extract<AgentEvent, { type: "tool_call" }> {
  return event.type === "tool_call";
}
```

Prefer discriminant narrowing when possible.

## Exhaustiveness

In default arms, assign the discriminant to a `never`-typed local.

```ts
// Value-returning switch
function label(event: AgentEvent): string {
  switch (event.type) {
    case "thinking":
    case "text":
      return event.delta;
    case "tool_call":
      return `$ ${event.command}`;
    case "tool_result":
      return event.output;
    case "notice":
      return event.message;
    case "turn_end":
      return `${event.usage.requests} requests`;
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

// Void switch
function render(event: AgentEvent): void {
  switch (event.type) {
    // ...one case per variant
    default: {
      const _exhaustive: never = event;
      void _exhaustive;
    }
  }
}
```

Return-style in value-returning switches, void-style in statement switches.

## `satisfies` over `as`

`satisfies` validates without widening literal types.

```ts
// Don't. Widens, loses literal types.
const defaults = { effort: "high", maxTokens: 64_000 } as Settings;

// Do. Validates AND preserves literal types.
const defaults = { effort: "high", maxTokens: 64_000 } satisfies Settings;
// defaults.effort is "high" (literal), not Effort
```

## Boundary validation

Validate once where data crosses in. Trust types inside. See the **principle-boundary-discipline** skill.

- **Provider responses** (streamed events, tool input): read the fields Orbi uses and ignore the rest, so a provider adding a field breaks nothing. A field Orbi needs that's missing or of the wrong type becomes a `notice` or an error result for the model, never a crash deep in the loop.
- **Persisted JSON** (the session log and token store): a version field and a try/catch around each parse.
- **Don't re-validate** deep in call chains.

## Derived types

When a type already exists (Orbi's own `AgentEvent`, `AgentOptions`, or the provider SDK's types), derive from it instead of writing the shape again.

```ts
// Don't. Duplicate shape, drifts when AgentEvent changes.
type ToolCall = { type: "tool_call"; id: string; command: string };

// Do. Derive from the source of truth.
type ToolCall = Extract<AgentEvent, { type: "tool_call" }>;
type EventType = AgentEvent["type"];
type Approve = AgentOptions["approve"];
```

Reach for `Extract`, `Pick`, `Omit`, `Parameters`, `ReturnType`, `Awaited`, `typeof` before writing a new interface. Provider SDK types stay in the provider adapter. The core uses Orbi's own message format ([ADR 0007](../../../../docs/adr/0007-message-format.md)).

## Object args

```ts
// Don't. Swap two strings, still compiles.
runBash(command, cwd);

// Do. Order-independent, self-documenting.
runBash({ command, cwd });
```

Skip on hot paths: stream parsers, per-frame TUI render, anything in a tight loop where the allocation cost matters.
