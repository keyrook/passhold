/**
 * What Passhold draws on a web page: the button in a sign-in field, the list
 * that opens from it, and the save prompt.
 *
 * Each sits in a closed shadow root, so the page's styles do not reach in and
 * its scripts cannot walk into the button. The list and the prompt are not
 * drawn here at all: each is an extension page in an iframe, an origin the web
 * page can neither read nor script. The logins in the list never pass through
 * this script, or through the page.
 */
import { markElements, PASSHOLD_MARK_COMPACT } from '@keyrook/brand';

const Z = '2147483647';
const BUTTON = 22;

function host(): { element: HTMLElement; root: ShadowRoot } {
  const element = document.createElement('passhold-overlay');
  element.style.cssText = `all: initial; position: fixed; z-index: ${Z}; top: 0; left: 0; width: 0; height: 0;`;
  const root = element.attachShadow({ mode: 'closed' });
  (document.body ?? document.documentElement).appendChild(element);
  return { element, root };
}

/** Keep a fixed-position element beside a field as the page scrolls and reflows. */
function follow(field: HTMLElement, place: (rect: DOMRect) => void): () => void {
  let frame = 0;
  const update = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => place(field.getBoundingClientRect()));
  };
  update();
  window.addEventListener('scroll', update, true);
  window.addEventListener('resize', update);
  const observer = new ResizeObserver(update);
  observer.observe(field);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', update, true);
    window.removeEventListener('resize', update);
    observer.disconnect();
  };
}

export class FieldButton {
  private readonly element: HTMLElement;
  private readonly button: HTMLButtonElement;
  private stop: (() => void) | null = null;
  field: HTMLInputElement | null = null;

  constructor(onPress: (field: HTMLInputElement) => void) {
    const { element, root } = host();
    this.element = element;
    root.innerHTML = `<style>
      button { all: initial; position: fixed; width: ${BUTTON}px; height: ${BUTTON}px; display: none;
        cursor: pointer; border-radius: 6px; padding: 2px; box-sizing: border-box; background: transparent; }
      button:hover { background: rgba(58, 111, 219, 0.12); }
      button:focus-visible { outline: 2px solid #3A6FDB; outline-offset: 1px; }
      svg { width: 100%; height: 100%; display: block; }
    </style><button type="button" tabindex="-1"><svg viewBox="0 0 100 100" aria-hidden="true">${markElements(PASSHOLD_MARK_COMPACT)}</svg></button>`;
    this.button = root.querySelector('button')!;
    this.button.setAttribute('aria-label', 'Passhold');
    // Pressing the button must not take focus from the field it serves.
    this.button.addEventListener('mousedown', (event) => event.preventDefault());
    this.button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.field) onPress(this.field);
    });
  }

  show(field: HTMLInputElement): void {
    if (this.field === field) return;
    this.hide();
    this.field = field;
    this.stop = follow(field, (rect) => {
      const style = this.button.style;
      if (rect.width < BUTTON * 2 || rect.bottom < 0 || rect.top > innerHeight) {
        style.display = 'none';
        return;
      }
      style.display = 'block';
      style.top = `${rect.top + (rect.height - BUTTON) / 2}px`;
      // At the end of the field: the right in a left-to-right page.
      const rtl = getComputedStyle(field).direction === 'rtl';
      style.left = `${rtl ? rect.left + 6 : rect.right - BUTTON - 6}px`;
    });
  }

  hide(): void {
    this.stop?.();
    this.stop = null;
    this.field = null;
    this.button.style.display = 'none';
  }

  contains(node: EventTarget | null): boolean {
    return node === this.element;
  }
}

/** An extension page framed onto the web page, beside a field or in a corner. */
export class Frame {
  private readonly element: HTMLElement;
  private readonly frame: HTMLIFrameElement;
  private stop: (() => void) | null = null;

  constructor(page: 'menu.html' | 'prompt.html', token: string, size: { width: number; height: number }) {
    const { element, root } = host();
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

  /** Under the field, or above it where there is no room below. */
  besideField(field: HTMLElement): void {
    this.stop = follow(field, (rect) => {
      const height = this.frame.offsetHeight;
      const width = this.frame.offsetWidth;
      const below = rect.bottom + 4;
      const top = below + height > innerHeight && rect.top - height - 4 > 0 ? rect.top - height - 4 : below;
      const left = Math.min(Math.max(8, rect.left), Math.max(8, innerWidth - width - 8));
      this.frame.style.top = `${top}px`;
      this.frame.style.left = `${left}px`;
    });
  }

  inCorner(): void {
    this.frame.style.top = '12px';
    this.frame.style.right = '12px';
  }

  contains(node: EventTarget | null): boolean {
    return node === this.element;
  }

  remove(): void {
    this.stop?.();
    this.element.remove();
  }
}
