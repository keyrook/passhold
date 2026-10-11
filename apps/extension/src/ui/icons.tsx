import type { SVGProps } from 'react';
import { ICONS, ICON_STROKE, PASSHOLD_MARK, PASSHOLD_MARK_COMPACT, type IconName, type MarkPart } from '@keyrook/brand';

type IconProps = SVGProps<SVGSVGElement>;

/**
 * One of Keyrook's interface icons, drawn in the brand's pen and stroked in
 * the text colour. Passhold draws none of its own: a new one is added to the
 * brand, so every Keyrook product gets the same drawing.
 */
function Icon({ glyph, ...props }: Omit<IconProps, 'name'> & { glyph: IconName }) {
  const icon = ICONS[glyph];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE[20]}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width="1em"
      height="1em"
      {...props}
    >
      {icon.d && <path d={icon.d} />}
      {'dots' in icon &&
        icon.dots?.map(([cx, cy, r]) => <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />)}
    </svg>
  );
}

const icon = (glyph: IconName) => (props: IconProps) => <Icon glyph={glyph} {...props} />;

export const SearchIcon = icon('search');
export const PlusIcon = icon('plus');
export const SettingsIcon = icon('settings');
export const LockIcon = icon('lock');
export const CopyIcon = icon('copy');
export const CheckIcon = icon('check');
export const TrashIcon = icon('trash');
export const EditIcon = icon('edit');
export const EyeIcon = icon('eye');
export const EyeOffIcon = icon('eye-off');
export const BackIcon = icon('chevron-left');
export const ChevronIcon = icon('chevron-right');
export const CloseIcon = icon('close');
export const StarIcon = icon('star');
export const RefreshIcon = icon('refresh');
export const ExternalIcon = icon('external');
export const ImportIcon = icon('import');
export const ExportIcon = icon('export');
export const GlobeIcon = icon('globe');
export const UserIcon = icon('user');
export const KeyIcon = icon('key');
export const AlertIcon = icon('error');
export const InfoIcon = icon('info');
export const HistoryIcon = icon('history');
export const UndoIcon = icon('undo');

function part(piece: MarkPart, index: number) {
  switch (piece.kind) {
    case 'stroke':
      return <path key={index} d={piece.d} fill="none" stroke={piece.colour} strokeWidth={piece.width} strokeLinecap="round" strokeLinejoin="round" />;
    case 'disc':
      return <circle key={index} cx={piece.cx} cy={piece.cy} r={piece.r} fill={piece.colour} />;
    case 'fill':
      return <path key={index} d={piece.d} fill={piece.colour} />;
    case 'ring':
      return <circle key={index} cx={piece.cx} cy={piece.cy} r={piece.r} fill="none" stroke={piece.colour} strokeWidth={piece.width} />;
  }
}

/** Passhold's own mark, never the crow: the crow is Keyrook's. */
export function PassholdMark({ size = 28, className }: { size?: number; className?: string }) {
  const mark = size < 32 ? PASSHOLD_MARK_COMPACT : PASSHOLD_MARK;
  return (
    <svg viewBox={mark.view.join(' ')} width={size} height={size} className={className} aria-hidden="true">
      {mark.parts.map(part)}
    </svg>
  );
}
