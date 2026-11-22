import type { Fetcher } from '@keyrook/account';

interface Answer {
  status: number;
  headers: [string, string][];
  body: string;
}

/**
 * Each refresh token spent once, however many hold it.
 *
 * The account's server ends a whole session when a refresh token it already
 * exchanged comes back: that is what makes a copied token worthless, and it
 * cannot tell a thief from the owner. The service worker holds several
 * sessions at once — a sync, a request a page made, Settings asking after
 * browsers waiting to be let in — each with its own copy of the tokens. Two
 * that find the access token lapsed together, or one that began before
 * another refreshed, would each spend the same refresh token, and the second
 * spend signs the browser out ("Keyrook signed this browser out").
 * @keyrook/account shares a refresh only while it is in flight, and only
 * between its own sessions.
 *
 * So every refresh this worker makes goes through here: the first spend of a
 * token goes to the server, and every other — at the same time or later — is
 * handed what the first was answered, the new pair it rotated to. A refusal is
 * not kept: the next try asks the server again.
 */
export function spendOnce(fetcher: Fetcher, remember = 16): Fetcher {
  const spent = new Map<string, Promise<Answer>>();
  return async (input, init) => {
    const token = refreshTokenOf(input, init);
    if (token === null) return fetcher(input, init);
    let answer = spent.get(token);
    if (!answer) {
      answer = fetcher(input, init).then(async (response) => ({ status: response.status, headers: [...response.headers], body: await response.text() }));
      spent.set(token, answer);
      answer.then(
        ({ status }) => void (status < 200 || status > 299 ? spent.delete(token) : undefined),
        () => void spent.delete(token),
      );
      // The oldest first: a pair that has since rotated many times over is never asked for again.
      while (spent.size > remember) spent.delete(spent.keys().next().value!);
    }
    const { status, headers, body } = await answer;
    return new Response(status === 204 || status === 205 || status === 304 ? null : body, { status, headers });
  };
}

function refreshTokenOf(input: string, init: RequestInit | undefined): string | null {
  if (init?.method !== 'POST' || typeof init.body !== 'string' || !new URL(input, 'http://x').pathname.endsWith('/auth/refresh')) return null;
  try {
    const { refreshToken } = JSON.parse(init.body) as { refreshToken?: unknown };
    return typeof refreshToken === 'string' ? refreshToken : null;
  } catch {
    return null;
  }
}
