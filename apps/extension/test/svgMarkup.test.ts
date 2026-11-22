/**
 * The bundled marks drawn as elements, never as markup (ui/svgMarkup.tsx):
 * every shape a mark holds is drawn, and nothing that is not a shape — a
 * script, an event handler, an address elsewhere — is, whatever the markup says.
 */
import { describe, expect, it } from 'vitest';
import { BRAND_ICONS } from '../src/ui/brand-icons.js';
import { parseMarkup } from '../src/ui/svgMarkup.js';

type Node = ReturnType<typeof parseMarkup>[number];
const all = (nodes: Node[]): Node[] => nodes.flatMap((node) => [node, ...all(node.children)]);

describe('a mark’s markup', () => {
  it('draws every shape of every bundled mark', () => {
    for (const [slug, icon] of Object.entries(BRAND_ICONS)) {
      if (icon.kind === 'mono') continue;
      const shapes = (icon.body.match(/<(path|circle|ellipse|rect|polygon|polyline|line|g|stop|linearGradient|radialGradient|defs|clipPath|mask|use)\b/g) ?? []).length;
      expect([slug, all(parseMarkup(icon.body)).length]).toEqual([slug, shapes]);
    }
  });

  it('draws no script, no handler and no address outside the mark, whatever it is handed', () => {
    const drawn = all(
      parseMarkup(
        '<script>alert(1)</script><path d="M0 0" onclick="alert(1)" fill="red"/><foreignObject><div>x</div></foreignObject><use href="https://evil.test/x.svg#a"/><use href="#mine"/><g style="fill:red;behavior:url(x)"><circle r="1"/></g>',
      ),
    );
    expect(drawn.map((node) => node.tag)).toEqual(['path', 'use', 'use', 'g', 'circle']);
    expect(drawn[0]!.props).toEqual({ d: 'M0 0', fill: 'red' });
    expect(drawn[1]!.props).toEqual({});
    expect(drawn[2]!.props).toEqual({ href: '#mine' });
    expect(drawn[3]!.props).toEqual({ style: { fill: 'red' } });
  });
});
