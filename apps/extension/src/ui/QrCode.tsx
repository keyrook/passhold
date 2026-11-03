import { useMemo } from 'react';
import encodeQR from 'qr';

/**
 * A QR code, made here. A QR service would be handed the very secret the code
 * carries, so the encoder is bundled and nothing leaves the page.
 *
 * Always black on white with a four-module margin, whatever the theme: that
 * is what a phone camera reads, and a dark-mode code is one it often will not.
 * On screen it is drawn at a whole number of pixels per module, so no module
 * rounds wider than its neighbours; on paper (`exact`) at the size asked.
 */
export function QrCode({ text, size = 200, label, exact = false }: { text: string; size?: number; label: string; exact?: boolean }) {
  const matrix = useMemo(() => encodeQR(text, 'raw', { ecc: 'medium', border: 4 }), [text]);
  const modules = matrix.length;
  const pixels = exact ? size : Math.max(1, Math.round(size / modules)) * modules;
  const path = useMemo(() => {
    let d = '';
    matrix.forEach((row, y) =>
      row.forEach((on, x) => {
        if (on) d += `M${x} ${y}h1v1h-1z`;
      }),
    );
    return d;
  }, [matrix]);

  return (
    <svg viewBox={`0 0 ${modules} ${modules}`} width={pixels} height={pixels} role="img" aria-label={label} shapeRendering="crispEdges" className="rounded-lg">
      <rect width={modules} height={modules} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}
