import type Anthropic from "@anthropic-ai/sdk";

const TIMEOUT_MS = 120_000;
const MAX_OUTPUT_CHARS = 30_000;

export const bashTool: Anthropic.Beta.BetaTool = {
  name: "bash",
  description:
    "Run a shell command in the project directory and return its combined stdout and stderr. " +
    "Each call starts a fresh shell, so `cd` and exported variables do not carry over to the next call. " +
    `Commands are killed after ${TIMEOUT_MS / 1000} seconds. Do not start interactive programs or servers that never exit.`,
  input_schema: {
    type: "object",
    properties: {
      command: { type: "string", description: "The command to run with bash -c" },
    },
    required: ["command"],
  },
  eager_input_streaming: true,
};

export interface BashResult {
  output: string;
  isError: boolean;
}

export async function runBash(command: string, cwd: string): Promise<BashResult> {
  // `exec 2>&1` merges stderr into stdout inside the shell, so the model sees
  // both streams interleaved in the order they were written.
  const proc = Bun.spawn(["bash", "-c", `exec 2>&1\n${command}`], {
    cwd,
    stdin: "ignore",
    stdout: "pipe",
  });

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    proc.kill();
  }, TIMEOUT_MS);

  const [raw, exitCode] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
  clearTimeout(timer);

  const output = truncate(raw.trimEnd()) || "[no output]";
  if (timedOut) {
    return { output: `${output}\n[killed after ${TIMEOUT_MS / 1000}s timeout]`, isError: true };
  }
  // A non-zero exit is information, not a tool failure: `grep` with no match exits 1.
  return { output: exitCode === 0 ? output : `${output}\n[exit code ${exitCode}]`, isError: false };
}

// Keep the start and the end: the command line and first errors are at the top,
// the summary line of a test run or build is at the bottom.
function truncate(text: string): string {
  if (text.length <= MAX_OUTPUT_CHARS) return text;
  const half = MAX_OUTPUT_CHARS / 2;
  const dropped = text.length - MAX_OUTPUT_CHARS;
  return `${text.slice(0, half)}\n\n[... ${dropped} characters truncated ...]\n\n${text.slice(-half)}`;
}
