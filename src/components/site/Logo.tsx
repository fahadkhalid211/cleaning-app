import Link from 'next/link';
import { BRAND } from '@/lib/config';

/**
 * Hoodie mark: a capital H that draws itself in, then a dot pops into the space
 * above the crossbar and keeps a gentle pulse, with a light sheen sweeping the tile.
 * Pure SVG + CSS (see .hd-* in globals.css). Motion stops for reduced-motion users.
 */
export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <span className="hd-mark" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <path className="hd-h" pathLength={100} d="M33 26 V74 M67 26 V74 M33 56 H67" />
        <circle className="hd-dot" cx="50" cy="37" r="7" />
      </svg>
    </span>
  );
}

export function Logo({ href = '/', tone = 'dark' }: { href?: string; tone?: 'dark' | 'light' }) {
  return (
    <Link href={href} className="hd-logo inline-flex items-center gap-2.5 font-bold text-[1.45rem] tracking-tight" aria-label={`${BRAND.name} home`}>
      <LogoMark />
      <span className={tone === 'light' ? 'text-white' : 'text-ink'}>{BRAND.name}</span>
    </Link>
  );
}
