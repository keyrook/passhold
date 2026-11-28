/**
 * Safe child command runner for agent `run_command` calls.
 *
 * Security invariants:
 * - Always spawns with `shell: false` (never executes through a shell).
 * - Strips `PASSHOLD_SESSION` and `PASSHOLD_MACHINE_TOKEN` (case-insensitively)
 *   from the child environment.
 * - Caps stdout and stderr at 1 MiB each and redacts every known secret (and
 *   its encodings) before returning output to the agent.
 * - Enforces a hard timeout (SIGTERM followed by SIGKILL).
 */
import { spawn } from 'node:child_process';
import { redactBytes, type SecretEntry } from '@passhold/core';

export const MAX_OUTPUT_BYTES = 1024 * 1024;

export interface SafeExecRequest {
  argv: readonly string[];
  cwd: string;
  /** Inherited base environment (will be scrubbed of Passhold auth variables). */
  baseEnv: NodeJS.ProcessEnv;
  /** Secret environment variables explicitly approved for this command. */
  injectedEnv: Record<string, string>;
  timeoutSeconds: number;
  /** Secrets to scrub from stdout and stderr. */
  redact: readonly SecretEntry[];
}

export interface SafeExecResult {
  exitCode: number;
  timedOut: boolean;
  stdout: string;
  stderr: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
}

export type CommandExecutor = (req: SafeExecRequest) => Promise<SafeExecResult>;

const SCRUBBED_ENV_NAMES = new Set(['PASSHOLD_SESSION', 'PASSHOLD_MACHINE_TOKEN']);

/** Builds the scrubbed child environment, stripping Passhold auth variables in any casing. */
export function buildChildEnv(baseEnv: NodeJS.ProcessEnv, injectedEnv: Record<string, string>): NodeJS.ProcessEnv {
  const childEnv: NodeJS.ProcessEnv = {};
  for (const [k, v] of Object.entries(baseEnv)) {
    if (v === undefined) continue;
    if (SCRUBBED_ENV_NAMES.has(k.toUpperCase())) continue;
    childEnv[k] = v;
  }
  for (const [k, v] of Object.entries(injectedEnv)) {
    if (SCRUBBED_ENV_NAMES.has(k.toUpperCase())) continue;
    childEnv[k] = v;
  }
  return childEnv;
}

export async function executeSafeCommand(req: SafeExecRequest): Promise<SafeExecResult> {
  const [program, ...args] = req.argv;
  if (!program) throw new Error('Command argv must not be empty.');
  const env = buildChildEnv(req.baseEnv, req.injectedEnv);

  return new Promise<SafeExecResult>((resolve, reject) => {
    const child = spawn(program, args, {
      cwd: req.cwd,
      env,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const outChunks: Buffer[] = [];
    const errChunks: Buffer[] = [];
    let outTotal = 0;
    let errTotal = 0;
    let stdoutTruncated = false;
    let stderrTruncated = false;
    let timedOut = false;
    let killTimer: ReturnType<typeof setTimeout> | null = null;

    const append = (chunks: Buffer[], totalRef: 'out' | 'err', chunk: Buffer) => {
      const current = totalRef === 'out' ? outTotal : errTotal;
      if (current >= MAX_OUTPUT_BYTES) {
        if (totalRef === 'out') stdoutTruncated = true;
        else stderrTruncated = true;
        return;
      }
      const remaining = MAX_OUTPUT_BYTES - current;
      if (chunk.length > remaining) {
        chunks.push(chunk.subarray(0, remaining));
        if (totalRef === 'out') {
          outTotal += remaining;
          stdoutTruncated = true;
        } else {
          errTotal += remaining;
          stderrTruncated = true;
        }
      } else {
        chunks.push(chunk);
        if (totalRef === 'out') outTotal += chunk.length;
        else errTotal += chunk.length;
      }
    };

    child.stdout?.on('data', (chunk: Buffer) => append(outChunks, 'out', chunk));
    child.stderr?.on('data', (chunk: Buffer) => append(errChunks, 'err', chunk));

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      killTimer = setTimeout(() => {
        try {
          child.kill('SIGKILL');
        } catch {
          // Process already exited.
        }
      }, 2_000);
    }, Math.max(1, req.timeoutSeconds) * 1000);

    child.once('error', (error) => {
      clearTimeout(timer);
      if (killTimer) clearTimeout(killTimer);
      reject(error);
    });

    child.once('close', (code, signal) => {
      clearTimeout(timer);
      if (killTimer) clearTimeout(killTimer);
      const outBytes = new Uint8Array(Buffer.concat(outChunks));
      const errBytes = new Uint8Array(Buffer.concat(errChunks));
      resolve({
        exitCode: code ?? (signal ? 128 : 1),
        timedOut,
        stdout: redactBytes(outBytes, req.redact),
        stderr: redactBytes(errBytes, req.redact),
        stdoutTruncated,
        stderrTruncated,
      });
    });
  });
}
