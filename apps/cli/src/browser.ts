/**
 * The person's own browser, for a sign-in with Google or GitHub: this program
 * never sees what is typed at either. It opens the account server's start
 * address there and listens on this computer alone for the answer.
 *
 * The answer is in the address's fragment, which a browser never sends to a
 * server — this one included. So the page served at `/oauth` reads its own
 * fragment and posts it back to the listener it came from.
 */
import { spawn } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

const PAGE = `<!doctype html>
<meta charset="utf-8">
<title>Passhold</title>
<body style="font: 16px system-ui; margin: 3rem auto; max-width: 28rem; text-align: center">
<p id="say">Finishing the sign-in…</p>
<script>
  fetch('/oauth/answer', { method: 'POST', body: location.hash.slice(1) })
    .then(function (answer) { document.getElementById('say').textContent = answer.ok ? 'Signed in. You can close this tab and go back to the terminal.' : 'This sign-in was not taken. Go back to the terminal and try again.'; })
    .catch(function () { document.getElementById('say').textContent = 'The terminal is no longer waiting. Go back to it and try again.'; });
  history.replaceState(null, '', '/oauth');
</script>`;

export interface Listener {
  port: number;
  /** The fragment the browser comes back with for the sign-in whose state this is, once: `ticket=…&state=…`. */
  answerFor(state: string): Promise<string>;
  close(): void;
}

/**
 * Listens on 127.0.0.1, on a port the system picks, for one answer. Only an
 * answer carrying the state asked for is taken: any page or program on this
 * computer can reach the port, and one with another state ends nothing.
 */
export async function listen(): Promise<Listener> {
  let expected: string | null = null;
  let settle!: (fragment: string) => void;
  const answer = new Promise<string>((resolve) => (settle = resolve));
  const server: Server = createServer((request, response) => {
    const path = (request.url ?? '').split('?')[0];
    if (request.method === 'GET' && path === '/oauth') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' });
      response.end(PAGE);
      return;
    }
    if (request.method === 'POST' && path === '/oauth/answer') {
      let body = '';
      request.on('data', (chunk: Buffer) => {
        if (body.length < 8_192) body += chunk.toString('utf8');
      });
      request.on('end', () => {
        const ours = expected !== null && new URLSearchParams(body).get('state') === expected;
        response.writeHead(ours ? 204 : 400).end();
        if (ours) settle(body);
      });
      return;
    }
    response.writeHead(404).end();
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return {
    port: (server.address() as AddressInfo).port,
    answerFor(state) {
      expected = state;
      return answer;
    },
    close: () => {
      server.close();
      server.closeAllConnections();
    },
  };
}

/** Opens an address in the system's browser; false when there is none to ask, and the address is shown instead. */
export function openBrowser(url: string, platform: NodeJS.Platform = process.platform): boolean {
  const [command, args] = platform === 'darwin' ? ['open', [url]] : platform === 'win32' ? ['rundll32', ['url.dll,FileProtocolHandler', url]] : ['xdg-open', [url]];
  try {
    const child = spawn(command, args as string[], { stdio: 'ignore', detached: true });
    child.on('error', () => undefined);
    child.unref();
    return true;
  } catch {
    return false;
  }
}
