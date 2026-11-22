/**
 * The bundled marks' SVG markup, drawn as elements — never as HTML. The web
 * vault runs under Trusted Types, where writing markup into a page is refused
 * outright, and a page that never writes markup has nothing of the kind to
 * get wrong. The marks are compile-time constants (brand-icons.ts); even so,
 * only the shapes and attributes they use are drawn, and anything else is
 * left out.
 */
import { createElement, type ReactNode } from 'react';

const TAGS = new Set(['g', 'path', 'circle', 'ellipse', 'rect', 'polygon', 'polyline', 'line', 'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask', 'use']);

/** Attributes as the markup writes them, and as React names them. */
const ATTRIBUTES: Record<string, string> = {
  d: 'd',
  fill: 'fill',
  'fill-rule': 'fillRule',
  'fill-opacity': 'fillOpacity',
  'clip-rule': 'clipRule',
  'clip-path': 'clipPath',
  stroke: 'stroke',
  'stroke-width': 'strokeWidth',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-linecap': 'strokeLinecap',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  offset: 'offset',
  opacity: 'opacity',
  id: 'id',
  cx: 'cx',
  cy: 'cy',
  r: 'r',
  rx: 'rx',
  ry: 'ry',
  x: 'x',
  y: 'y',
  x1: 'x1',
  y1: 'y1',
  x2: 'x2',
  y2: 'y2',
  fx: 'fx',
  fy: 'fy',
  width: 'width',
  height: 'height',
  points: 'points',
  transform: 'transform',
  gradientUnits: 'gradientUnits',
  gradientTransform: 'gradientTransform',
  maskUnits: 'maskUnits',
  mask: 'mask',
  href: 'href',
  'xlink:href': 'href',
  class: 'className',
  style: 'style',
};

interface Node {
  tag: string;
  props: Record<string, unknown>;
  children: Node[];
}

const TOKEN = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+\s*=\s*"[^"]*")*)\s*(\/?)>/g;
const ATTRIBUTE = /([\w:-]+)\s*=\s*"([^"]*)"/g;

/** `fill:#fff;opacity:.5` as React's style object, of the properties a mark may set. */
function styleOf(text: string): Record<string, string> {
  const style: Record<string, string> = {};
  for (const part of text.split(';')) {
    const [name, value] = part.split(':').map((piece) => piece?.trim() ?? '');
    if (!name || !value || !/^(fill|stroke|opacity|fill-opacity|stop-color|stop-opacity|mix-blend-mode|isolation)$/.test(name)) continue;
    style[name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())] = value;
  }
  return style;
}

function propsOf(text: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const [, name, value] of text.matchAll(ATTRIBUTE)) {
    const react = ATTRIBUTES[name!];
    // An address in a mark points inside it (`#id`), never anywhere else.
    if (!react || (react === 'href' && !value!.startsWith('#'))) continue;
    props[react] = react === 'style' ? styleOf(value!) : value;
  }
  return props;
}

/** The markup as a tree of the shapes it names; what is not a known shape is dropped with all it holds. */
export function parseMarkup(markup: string): Node[] {
  const root: Node = { tag: '', props: {}, children: [] };
  const open: Node[] = [root];
  for (const [, closing, tag, attributes, selfClosing] of markup.matchAll(TOKEN)) {
    const parent = open[open.length - 1]!;
    if (closing) {
      if (open.length > 1 && parent.tag === tag) open.pop();
      continue;
    }
    const node: Node = { tag: tag!, props: propsOf(attributes ?? ''), children: [] };
    if (TAGS.has(tag!)) parent.children.push(node);
    if (!selfClosing) open.push(node);
  }
  return root.children;
}

function draw(nodes: Node[]): ReactNode[] {
  return nodes.map((node, index) => createElement(node.tag, { ...node.props, key: index }, ...draw(node.children)));
}

const drawn = new Map<string, ReactNode[]>();

/** A mark's markup as React elements, made once per mark. */
export function Markup({ body }: { body: string }) {
  let elements = drawn.get(body);
  if (!elements) {
    elements = draw(parseMarkup(body));
    drawn.set(body, elements);
  }
  return <>{elements}</>;
}
