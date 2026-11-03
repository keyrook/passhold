import { useMemo } from 'react';
import { brandFor } from '@passhold/core';
import { INK, NEUTRAL } from '@keyrook/brand';
import { BRAND_ICONS } from './brand-icons.js';
import { cx } from './primitives.js';

/**
 * Relative luminance, so a glyph is never white on a near-white brand colour:
 * the foreground is chosen per brand, not by design hunch.
 */
export function isLight(hex: string): boolean {
  const value = Number.parseInt(hex, 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b! > 0.55;
}

/** A letter on a crayon-tinted tile, for a site no bundled set has a mark for. */
export function Monogram({ title, size = 36 }: { title: string; size?: number }) {
  const letter = [...(title.trim() || '?')][0]!.toLocaleUpperCase();
  const tints = [
    'bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-200',
    'bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200',
    'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
    'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
  ];
  const tint = tints[[...title].reduce((sum, char) => sum + char.codePointAt(0)!, 0) % tints.length];
  return (
    <span
      aria-hidden="true"
      className={cx('flex shrink-0 items-center justify-center rounded-lg font-semibold', tint)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {letter}
    </span>
  );
}

/**
 * The site's mark, or its letter. Every mark is compiled in; nothing here
 * fetches anything, and nothing here ever should: an icon requested at display
 * time would tell whoever serves it every site its owner has an account on.
 */
export function SiteMark({ title, urls, size = 36 }: { title: string; urls: readonly string[]; size?: number }) {
  const brand = useMemo(() => brandFor(title, urls), [title, urls]);
  const icon = brand ? BRAND_ICONS[brand.slug] : undefined;
  if (!icon) return <Monogram title={title || urls[0] || ''} size={size} />;

  const glyph = Math.round(size * (icon.wide ? 0.82 : 0.58));
  // On a dark page a near-black mark (GitHub's, X's) would lose its edge without the faint ring.
  const tile = 'flex shrink-0 items-center justify-center rounded-lg dark:ring-1 dark:ring-inset dark:ring-white/10';
  const ring = 'ring-1 ring-inset ring-neutral-200 dark:ring-neutral-700';

  // Full-colour artwork as its designers drew it, on white: recolouring it to
  // fit a tile is how a logo stops looking like the logo.
  if (icon.kind === 'color') {
    return (
      <span aria-hidden="true" className={cx(tile, ring)} style={{ width: size, height: size, background: '#FFFFFF' }}>
        {/* Compile-time constant from the bundled sets: never input, never fetched. */}
        <svg viewBox={icon.viewBox} width={glyph} height={glyph} color={INK} dangerouslySetInnerHTML={{ __html: icon.body }} />
      </span>
    );
  }

  const hex = icon.hex ?? NEUTRAL[600].slice(1);
  const light = isLight(hex);
  const foreground = light ? INK : NEUTRAL[0];
  return (
    <span aria-hidden="true" className={cx(tile, light && ring)} style={{ width: size, height: size, background: `#${hex}` }}>
      {icon.kind === 'flat' ? (
        <svg viewBox={icon.viewBox} width={glyph} height={glyph} color={foreground} fill="currentColor" dangerouslySetInnerHTML={{ __html: icon.body }} />
      ) : (
        <svg viewBox={icon.viewBox} width={glyph} height={glyph} fill={foreground}>
          <path d={icon.body} />
        </svg>
      )}
    </span>
  );
}
