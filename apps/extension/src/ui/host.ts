/**
 * What the page around a shared screen can do. The extension's popup sends
 * its owner to the settings tab for what it cannot hold — a file chooser, a
 * Send — while the web vault holds no settings tab, and offers only what it
 * does at launch: a Send waits until after it. Set once, before the first render, by the web vault's page.
 */
export interface Host {
  /** Whether a Send of a login is offered here at all. */
  send: boolean;
  /** Opens the settings tab at `hash` (`files=<id>`, `send=<id>`). */
  openSettings(hash: string): void;
}

let host: Host = {
  send: true,
  openSettings: (hash) => void chrome.tabs.create({ url: chrome.runtime.getURL(`options.html#${hash}`) }),
};

export function setHost(next: Host): void {
  host = next;
}

export function currentHost(): Host {
  return host;
}
