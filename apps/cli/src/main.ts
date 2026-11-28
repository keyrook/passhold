/**
 * `passhold`, as a program: the commands (cli.ts) with this process's own
 * terminal, input and children.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename, delimiter, join } from 'node:path';
import { createInterface } from 'node:readline';
import { run, type Context } from './cli.js';

/** A line typed at the terminal with nothing shown as it is typed; with no terminal, the next line of the input. */
function secret(prompt: string): Promise<string> {
  const input = process.stdin;
  if (!input.isTTY) return pipedLine();
  return new Promise((resolve, reject) => {
    process.stderr.write(prompt);
    let typed = '';
    input.setRawMode(true);
    input.resume();
    const done = () => {
      input.setRawMode(false);
      input.pause();
      input.off('data', key);
      process.stderr.write('\n');
    };
    const key = (chunk: Buffer) => {
      for (const char of chunk.toString('utf8')) {
        if (char === '\r' || char === '\n') {
          done();
          resolve(typed);
          return;
        }
        if (char === '\u0003') {
          done();
          reject(new Error('Cancelled.'));
          return;
        }
        if (char === '\u007f' || char === '\b') typed = typed.slice(0, -1);
        else typed += char;
      }
    };
    input.on('data', key);
  });
}

/**
 * The lines of an input that is not a terminal, one per question, in order:
 * one reader for them all, or the first question's would take every line
 * there was and leave the next an empty answer. Between questions it is
 * paused, so a pipe left open keeps nothing waiting once the command is done.
 */
let piped: { next(): Promise<string> } | undefined;
function pipedLine(): Promise<string> {
  if (!piped) {
    const lines = createInterface({ input: process.stdin });
    const queue: string[] = [];
    const waiting: ((line: string) => void)[] = [];
    let ended = false;
    lines.on('line', (typed) => {
      const next = waiting.shift();
      if (next) next(typed);
      else queue.push(typed);
      if (!waiting.length) lines.pause();
    });
    lines.on('close', () => {
      ended = true;
      for (const next of waiting.splice(0)) next('');
    });
    piped = {
      next() {
        if (queue.length) return Promise.resolve(queue.shift()!);
        if (ended) return Promise.resolve('');
        return new Promise((resolve) => {
          waiting.push(resolve);
          lines.resume();
        });
      },
    };
  }
  return piped.next();
}

/** A line of the input, shown as it is typed; the prompt only where someone is there to read it. */
function line(prompt: string, shown = true): Promise<string> {
  if (!process.stdin.isTTY) return pipedLine();
  if (shown) process.stderr.write(prompt);
  return new Promise((resolve) => {
    const lines = createInterface({ input: process.stdin });
    // Answered before closing: closing ends the input there and then, and an end with no line is an empty answer.
    lines.once('line', (typed) => {
      resolve(typed);
      lines.close();
    });
    lines.once('close', () => resolve(''));
  });
}

async function input(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

function exec(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', env });
    child.once('error', (error) => {
      process.stderr.write(`${error.message}\n`);
      resolve(127);
    });
    child.once('exit', (code, signal) => resolve(code ?? (signal ? 128 : 1)));
  });
}

/** Whether a program is on the PATH. */
function onPath(program: string): boolean {
  return (process.env.PATH ?? '').split(delimiter).some((folder) => folder && existsSync(join(folder, program)));
}

/** A program's answer, yes when it ends well and says what `yes` says; never yes after a minute without one. */
function answered(command: string, args: string[], env: NodeJS.ProcessEnv = process.env, yes?: (out: string) => boolean): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { env, stdio: ['ignore', 'pipe', 'ignore'] });
    let out = '';
    child.stdout.on('data', (chunk: Buffer) => (out += chunk.toString('utf8')));
    const timer = setTimeout(() => child.kill(), 65_000);
    child.once('error', () => resolve(false));
    child.once('exit', (code) => {
      clearTimeout(timer);
      resolve(code === 0 && (yes ? yes(out.trim()) : true));
    });
  });
}

/**
 * How the agent asks before it signs, where its owner will see it: their own
 * askpass program if they named one, as OpenSSH's agent asks; else a dialog
 * of the system's; else the terminal it runs in. The question goes to each
 * as an argument or in the environment, never inside a script.
 */
function approver(): Context['approve'] {
  const env = process.env;
  if (env.SSH_ASKPASS) {
    const program = env.SSH_ASKPASS;
    return { how: `with ${basename(program)}`, ask: (question) => answered(program, [question], { ...env, SSH_ASKPASS_PROMPT: 'confirm' }) };
  }
  if (process.platform === 'darwin') {
    const script = [
      'on run argv',
      'display dialog (item 1 of argv) with title "Passhold" buttons {"Deny", "Allow"} default button "Deny" cancel button "Deny" with icon caution giving up after 60',
      'return button returned of result',
      'end run',
    ];
    return { how: 'in a dialog', ask: (question) => answered('osascript', [...script.flatMap((part) => ['-e', part]), '--', question], env, (out) => out === 'Allow') };
  }
  if (process.platform === 'win32') {
    const script = "Add-Type -AssemblyName PresentationFramework; if ([System.Windows.MessageBox]::Show($env:PASSHOLD_QUESTION, 'Passhold', 'YesNo', 'Question', 'No') -eq 'Yes') { exit 0 } else { exit 1 }";
    return { how: 'in a dialog', ask: (question) => answered('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { ...env, PASSHOLD_QUESTION: question }) };
  }
  if (env.DISPLAY || env.WAYLAND_DISPLAY) {
    if (onPath('zenity')) {
      return { how: 'in a dialog', ask: (question) => answered('zenity', ['--question', '--no-markup', '--title=Passhold', `--text=${question}`, '--ok-label=Allow', '--cancel-label=Deny', '--timeout=60']) };
    }
    // kdialog reads text that looks like markup as markup.
    if (onPath('kdialog')) return { how: 'in a dialog', ask: (question) => answered('kdialog', ['--title', 'Passhold', '--yesno', question.replace(/</g, '‹').replace(/&/g, '+')]) };
  }
  if (process.stdin.isTTY) return { how: 'at this terminal', ask: async (question) => /^y(es)?$/i.test((await line(`${question} [y/N] `)).trim()) };
  return undefined;
}

let stopping: AbortSignal | undefined;

const context: Context = {
  argv: process.argv.slice(2),
  env: process.env,
  out: (text) => void process.stdout.write(text),
  write: (bytes) => void process.stdout.write(bytes),
  err: (text) => void process.stderr.write(text),
  secret,
  line,
  input,
  exec,
  isTTY: Boolean(process.stdin.isTTY && process.stderr.isTTY),
  get approve() {
    return approver();
  },
  // Only what runs until stopped reads this: every other command ends with Ctrl-C as any program does.
  get signal() {
    if (!stopping) {
      const controller = new AbortController();
      for (const name of ['SIGINT', 'SIGTERM'] as const) process.once(name, () => controller.abort());
      stopping = controller.signal;
    }
    return stopping;
  },
};

// No top-level await: the single-file programs are CommonJS.
void run(context).then((code) => {
  process.exitCode = code;
});
