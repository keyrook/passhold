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

export async function clearClipboardLater(afterMs: number): Promise<void> {
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
    sender.origin === `chrome-extension://${chrome.runtime.id}` &&
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'offscreen/done'
  ) {
    void chrome.offscreen.closeDocument().catch(() => undefined);
  }
  return false;
});
