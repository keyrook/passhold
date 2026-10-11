/**
 * The offscreen document: waits, then empties the clipboard, then asks the
 * service worker to close it. A second copy before the first is cleared
 * restarts the wait.
 */
let timer: ReturnType<typeof setTimeout> | undefined;

function clearClipboard(): void {
  // execCommand('copy') with the copy event's data replaced: the one way to
  // write the clipboard from a document that never has focus.
  const onCopy = (event: ClipboardEvent) => {
    event.clipboardData?.setData('text/plain', '');
    event.preventDefault();
  };
  document.addEventListener('copy', onCopy);
  document.execCommand('copy');
  document.removeEventListener('copy', onCopy);
}

chrome.runtime.onMessage.addListener((message: unknown, sender) => {
  if (sender.id !== chrome.runtime.id) return false;
  const request = message as { type?: unknown; afterMs?: unknown };
  if (request?.type !== 'offscreen/clear' || typeof request.afterMs !== 'number') return false;
  clearTimeout(timer);
  timer = setTimeout(() => {
    clearClipboard();
    void chrome.runtime.sendMessage({ type: 'offscreen/done' });
  }, Math.min(Math.max(request.afterMs, 1_000), 10 * 60_000));
  return false;
});
