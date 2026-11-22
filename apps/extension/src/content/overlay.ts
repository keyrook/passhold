/**
 * What Passhold draws on a web page: the button in a sign-in field, the list
 * that opens from it, the save prompt, and the frame where a site's passkey
 * is saved or chosen.
 *
 * Each sits in a closed shadow root, so the page's styles do not reach in and
 * its scripts cannot walk into the button. The list and the prompt are not
 * drawn here at all: each is an extension page in an iframe, an origin the web
 * page can neither read nor script. The logins in the list never pass through
 * this script, or through the page.
 *
 * Where each goes keeps clear of the browser's own: Chrome draws its list of
 * saved passwords, cards and addresses under the field, and asks to save a
 * password from the top corner by the address bar — both over the page, and
 * over anything Passhold puts there.
 */
import { markElements, PASSHOLD_MARK_COMPACT } from '@keyrook/brand';
import { FRAME_MOVED } from '../lib/messaging.js';

const Z = '2147483647';
const BUTTON = 22;
/** Room between a field and the list beside it. */
const GAP = 6;
/** How near the window's edge Passhold draws. */
const EDGE = 8;
/** How far from the window's corner the prompt sits. */
const CORNER = 16;

/**
 * Where on the page Passhold draws for an element: inside the modal dialog or
 * the popover that holds it, or on the page itself. A dialog opened with
 * showModal() sits in the browser's top layer, above any z-index, and makes
 * the rest of the page inert: drawn outside it, the button and the list would
 * be behind it and could not be clicked. A popover closes on a click outside
 * it, and a click in the list would be one.
 */
function layerFor(element: Element | null): Element {
  const holder = element?.closest('dialog:modal, :popover-open') ?? [...document.querySelectorAll('dialog:modal')].at(-1);
  return holder ?? document.documentElement;
}

function host(layer: Element): { element: HTMLElement; root: ShadowRoot } {
  const element = document.createElement('passhold-overlay');
  element.style.cssText = `all: initial; position: fixed; z-index: ${Z}; top: 0; left: 0; width: 0; height: 0;`;
  const root = element.attachShadow({ mode: 'closed' });
  // On <html>, not <body>: a page that transforms or filters its body would
  // move everything fixed inside it along.
  layer.appendChild(element);
  return { element, root };
}

/**
 * Where the host's own box starts. A fixed element is placed from the window's
 * corner — unless an ancestor is transformed, filtered or contained, as a
 * dialog that slides in is: then from that ancestor's corner, and everything
 * drawn by the window's measure would be off by this much.
 */
function originOf(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return { x: rect.left, y: rect.top };
}

/** Keep a fixed-position element beside a field as the page scrolls, reflows or is typed in. */
function follow(field: HTMLElement, place: (rect: DOMRect) => void): () => void {
  let frame = 0;
  const update = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => place(field.getBoundingClientRect()));
  };
  update();
  window.addEventListener('scroll', update, true);
  window.addEventListener('resize', update);
  // A page may draw a control over the field's end once something is typed: a clear button, an eye.
  field.addEventListener('input', update);
  const observer = new ResizeObserver(update);
  observer.observe(field);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', update, true);
    window.removeEventListener('resize', update);
    field.removeEventListener('input', update);
    observer.disconnect();
  };
}

const isRtl = (element: Element) => getComputedStyle(element).direction === 'rtl';

export class FieldButton {
  /**
   * Drawn the first time a sign-in field needs it, never before: a page with
   * no sign-in field gets nothing of Passhold's in its document. Anti-bot
   * checks, Cloudflare's among them, fail on an element they did not put there.
   */
  private drawn: { element: HTMLElement; button: HTMLButtonElement } | null = null;
  private stop: (() => void) | null = null;
  field: HTMLInputElement | null = null;

  constructor(private readonly onPress: (field: HTMLInputElement) => void) {}

  private draw(layer: Element): { element: HTMLElement; button: HTMLButtonElement } {
    if (this.drawn) {
      if (this.drawn.element.parentElement !== layer) layer.appendChild(this.drawn.element);
      return this.drawn;
    }
    const { element, root } = host(layer);
    // Built node by node, never from markup: whatever a page does to the
    // prototypes it shares with this script, nothing of its own is parsed here.
    const style = document.createElement('style');
    style.textContent = `
      button { all: initial; position: fixed; width: ${BUTTON}px; height: ${BUTTON}px; display: none;
        cursor: pointer; border-radius: 6px; padding: 2px; box-sizing: border-box; background: transparent; }
      button:hover { background: rgba(58, 111, 219, 0.12); }
      button:focus-visible { outline: 2px solid #3A6FDB; outline-offset: 1px; }
      svg { width: 100%; height: 100%; display: block; }
    `;
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    // The mark is the brand kit's own, fixed in the package: parsed as an image, never as a page.
    const mark = new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-hidden="true">${markElements(PASSHOLD_MARK_COMPACT)}</svg>`,
      'image/svg+xml',
    ).documentElement;
    button.append(document.importNode(mark, true));
    root.append(style, button);
    button.setAttribute('aria-label', 'Passhold');
    // Pressing the button must not take focus from the field it serves.
    button.addEventListener('mousedown', (event) => event.preventDefault());
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.field) this.onPress(this.field);
    });
    this.drawn = { element, button };
    return this.drawn;
  }

  /**
   * How far in from the field's end the button goes: past whatever the page
   * draws over that end — the eye that shows the password, a clear button, a
   * caps-lock mark — so the button never sits on one of the page's own.
   */
  private insetFor(field: HTMLInputElement, rect: DOMRect, rtl: boolean): number {
    const root = field.getRootNode() as Document | ShadowRoot;
    const mine = this.drawn?.element;
    let inset = 6;
    for (let step = 0; step < 3; step++) {
      const x = rtl ? rect.left + inset + BUTTON / 2 : rect.right - inset - BUTTON / 2;
      const stack = root.elementsFromPoint(x, rect.top + rect.height / 2);
      const under = stack.indexOf(field);
      // Something drawn over the field there that is not what holds it.
      const over = under < 0 ? undefined : stack.slice(0, under).find((element) => element !== mine && !element.contains(field));
      if (!over) return inset;
      const box = over.getBoundingClientRect();
      inset = (rtl ? box.right - rect.left : rect.right - box.left) + 4;
    }
    return inset;
  }

  show(field: HTMLInputElement): void {
    if (this.field === field) return;
    this.hide();
    this.field = field;
    const { element, button } = this.draw(layerFor(field));
    this.stop = follow(field, (rect) => {
      const style = button.style;
      const rtl = isRtl(field);
      const inset = this.insetFor(field, rect, rtl);
      // Room for the button and still most of the field for what is typed.
      if (inset + BUTTON > rect.width / 2 || rect.bottom < 0 || rect.top > innerHeight) {
        style.display = 'none';
        return;
      }
      const origin = originOf(element);
      style.display = 'block';
      style.top = `${rect.top + (rect.height - BUTTON) / 2 - origin.y}px`;
      // At the end of the field: the right in a left-to-right page.
      style.left = `${(rtl ? rect.left + inset : rect.right - BUTTON - inset) - origin.x}px`;
    });
  }

  hide(): void {
    this.stop?.();
    this.stop = null;
    this.field = null;
    if (this.drawn) this.drawn.button.style.display = 'none';
  }

  contains(node: EventTarget | null): boolean {
    return node !== null && node === this.drawn?.element;
  }
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const overlaps = (a: Box, b: Box) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/** The page's own controls a list could cover: fields and buttons, and frames, which hold them. */
function controls(except: readonly Element[]): Box[] {
  const boxes: Box[] = [];
  for (const element of document.querySelectorAll('input:not([type="hidden"]), select, textarea, button, iframe')) {
    if (except.some((skip) => skip === element || skip.contains(element))) continue;
    const box = element.getBoundingClientRect();
    if (box.width >= 2 && box.height >= 2) boxes.push(box);
  }
  return boxes;
}

type Side = 'end' | 'start' | 'above' | 'below';

/** An extension page framed onto the web page, beside a field or in a corner. */
export class Frame {
  private readonly element: HTMLElement;
  private readonly frame: HTMLIFrameElement;
  private stop: (() => void) | null = null;
  /** Where it was last put, to tell the page inside when that changes. */
  private at = '';
  /** The side of its field it was put on: kept while it is up, so it never jumps from one to another. */
  private side: Side | null = null;
  private corner = false;

  constructor(page: 'menu.html' | 'prompt.html' | 'passkey.html', token: string, size: { width: number; height: number }, near: Element | null = null) {
    const { element, root } = host(layerFor(near));
    this.element = element;
    this.frame = document.createElement('iframe');
    // Only Passhold's own script may frame this address: a web page that
    // frames it gets nothing (use_dynamic_url), so a page can neither put up
    // a list of its own nor load it to learn whether Passhold is installed.
    // And the frame sits in a closed shadow root, so its token is not the
    // page's to read.
    this.frame.src = `${chrome.runtime.getURL(page)}#${token}`;
    this.frame.setAttribute('allowtransparency', 'true');
    this.frame.title = 'Passhold';
    Object.assign(this.frame.style, {
      position: 'fixed',
      border: '0',
      width: `${size.width}px`,
      height: `${size.height}px`,
      colorScheme: 'normal',
      background: 'transparent',
      display: 'block',
    } satisfies Partial<CSSStyleDeclaration>);
    root.appendChild(this.frame);
  }

  /** Beside the field: see `place`. */
  besideField(field: HTMLElement): void {
    const rtl = isRtl(field);
    this.stop = follow(field, (rect) => this.place(rect, rtl, [field]));
  }

  /**
   * Beside a field in a frame of this page too small to hold the list, as if
   * drawn there: `field` is the field's place in that frame, kept to the
   * frame's own box, so the frame cannot have the list put anywhere else on
   * the page.
   */
  besideFieldIn(frame: HTMLIFrameElement, field: { left: number; right: number; top: number; bottom: number }): void {
    const rtl = isRtl(frame);
    this.stop = follow(frame, (rect) => {
      const x = rect.left + frame.clientLeft;
      const y = rect.top + frame.clientTop;
      const within = (value: number, size: number) => Math.min(Math.max(value, 0), size);
      this.place(
        {
          left: x + within(field.left, frame.clientWidth),
          right: x + within(field.right, frame.clientWidth),
          top: y + within(field.top, frame.clientHeight),
          bottom: y + within(field.bottom, frame.clientHeight),
        },
        rtl,
        [frame],
      );
    });
  }

  /**
   * Not under the field, where Chrome draws its own list of saved passwords
   * over anything on the page: beside the field's end, where Passhold's button
   * is; beside its start; above it, which Chrome takes only when there is no
   * room below. Each where the window has room and the list would cover none
   * of the page's fields or buttons — the next field of an inline form, the
   * button that sends it. Under the field only when nothing else will do.
   * Chosen once: the list then keeps to that side as the page moves.
   */
  private place(rect: Box, rtl: boolean, own: readonly Element[]): void {
    const height = this.frame.offsetHeight;
    const width = this.frame.offsetWidth;
    const across = (left: number) => Math.min(Math.max(EDGE, left), Math.max(EDGE, innerWidth - width - EDGE));
    const alongside = Math.min(Math.max(EDGE, rect.top), Math.max(EDGE, innerHeight - height - EDGE));
    const spots: Record<Side, { left: number; top: number; fits: boolean }> = {
      end: rtl
        ? { left: rect.left - GAP - width, top: alongside, fits: rect.left - GAP - width >= EDGE }
        : { left: rect.right + GAP, top: alongside, fits: rect.right + GAP + width <= innerWidth - EDGE },
      start: rtl
        ? { left: rect.right + GAP, top: alongside, fits: rect.right + GAP + width <= innerWidth - EDGE }
        : { left: rect.left - GAP - width, top: alongside, fits: rect.left - GAP - width >= EDGE },
      above: { left: across(rect.left), top: rect.top - GAP - height, fits: rect.top - GAP - height >= EDGE },
      below: { left: across(rect.left), top: rect.bottom + GAP, fits: rect.bottom + GAP + height <= innerHeight - EDGE },
    };
    if (!this.side) {
      const boxes = controls(own);
      const covers = (side: Side) => {
        const spot = spots[side];
        const box = { left: spot.left, top: spot.top, right: spot.left + width, bottom: spot.top + height };
        return boxes.filter((control) => overlaps(box, control)).length;
      };
      // In a form packed so tight that every side covers something — a
      // checkout's grid of fields — the side that covers fewest; the first in
      // this order of those that cover as few.
      const fitting = (['end', 'start', 'above', 'below'] as const).filter((side) => spots[side].fits);
      this.side = fitting.length ? fitting.reduce((best, side) => (covers(side) < covers(best) ? side : best)) : 'below';
    }
    const spot = spots[this.side];
    this.put(spot.left, this.side === 'below' && !spot.fits && rect.top - GAP - height > 0 ? rect.top - GAP - height : spot.top);
  }

  private put(left: number, top: number): void {
    const origin = originOf(this.element);
    this.frame.style.top = `${top - origin.y}px`;
    this.frame.style.left = `${left - origin.x}px`;
    const at = `${top},${left}`;
    // Moved — the page scrolled, or moved or resized the field — under a
    // pointer that may not have moved: the page inside waits again before a
    // click counts (ui/useVisible.ts). To any origin: the frame's address is
    // the dynamic one (use_dynamic_url), not the origin its page runs in, and
    // all the word can do anywhere is make a click wait.
    if (this.at && at !== this.at) this.frame.contentWindow?.postMessage({ source: FRAME_MOVED }, '*');
    this.at = at;
  }

  /**
   * The bottom corner: Chrome asks to save a password, a card or an address
   * from the top one, by the address bar, and its bubble would sit over
   * Passhold's asking the same. The end of the line in the browser's own
   * language: the right, or the left where it reads right to left.
   */
  inCorner(): void {
    this.corner = true;
    const rtl = chrome.i18n.getMessage('@@bidi_dir') === 'rtl';
    const update = () => {
      const left = rtl ? CORNER : innerWidth - this.frame.offsetWidth - CORNER;
      this.put(Math.max(EDGE, left), Math.max(EDGE, innerHeight - this.frame.offsetHeight - CORNER));
    };
    update();
    window.addEventListener('resize', update);
    this.stop = () => window.removeEventListener('resize', update);
  }

  /**
   * The height the page inside measured for its card: the frame covers no
   * more of the page than that. In the corner the frame's foot stays where it
   * is, and so does the card, drawn at the foot of its frame.
   */
  resize(height: number): void {
    this.frame.style.height = `${height}px`;
    if (this.corner) {
      const origin = originOf(this.element);
      this.frame.style.top = `${Math.max(EDGE, innerHeight - height - CORNER) - origin.y}px`;
    }
  }

  contains(node: EventTarget | null): boolean {
    return node === this.element;
  }

  remove(): void {
    this.stop?.();
    this.element.remove();
  }
}
