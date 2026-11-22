/**
 * Clearing a copied password after a while.
 *
 * A service worker has no clipboard, and Chrome may stop it long before a
 * minute is up, so the timer and the clearing live in an offscreen document,
 * which stays until it has done its job and asks to be closed.
 *
 * It clears whatever is on the clipboard by then. Checking that it is still
 * our password would need `clipboardRead`, whose install warning ("read data
 * you copy and paste") is a worse trade than clearing a later copy the owner
 * made within the same minute.
 */
const OFFSCREEN_URL = 'offscreen.html';

async function hasOffscreen(): Promise<boolean> {
  const contexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_URL)],
  });
  return contexts.length > 0;
}

/** The alarm that empties the clipboard where there is no offscreen document to wait in. */
export const CLIPBOARD_ALARM = 'ph.clipboard';

/**
 * Whether the browser has offscreen documents. Firefox has none, and no need
 * of one: its background is a page with a clipboard of its own, woken by an
 * alarm when the time is up.
 */
const offscreen = () => typeof chrome.offscreen !== 'undefined';

/** The clipboard emptied from the background page itself: what the alarm calls. */
export async function clearClipboardNow(): Promise<void> {
  await navigator.clipboard.writeText('').catch(() => undefined);
}

export async function clearClipboardLater(afterMs: number): Promise<void> {
  if (!offscreen()) {
    await chrome.alarms.create(CLIPBOARD_ALARM, { when: Date.now() + afterMs });
    return;
  }
  if (!(await hasOffscreen())) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: [chrome.offscreen.Reason.CLIPBOARD],
      justification: 'Clear a copied password from the clipboard after the time the user chose.',
    });
  }
  await chrome.runtime.sendMessage({ type: 'offscreen/clear', afterMs });
}

chrome.runtime.onMessage.addListener((message: unknown, sender) => {
  if (
    sender.id === chrome.runtime.id &&
    sender.origin === new URL(chrome.runtime.getURL('')).origin &&
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'offscreen/done'
  ) {
    if (offscreen()) void chrome.offscreen.closeDocument().catch(() => undefined);
  }
  return false;
});
