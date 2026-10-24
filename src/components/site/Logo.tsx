import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { BRAND } from '@/lib/config';

export function Logo({ href = '/', tone = 'dark' }: { href?: string; tone?: 'dark' | 'light' }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-bold text-[1.35rem] tracking-tight" aria-label={`${BRAND.name} home`}>
      <span className="flex size-9 items-center justify-center rounded-full bg-brand text-white">
        <Sparkles className="size-5" aria-hidden />
      </span>
      <span className={tone === 'light' ? 'text-white' : 'text-ink'}>{BRAND.name}</span>
    </Link>
  );
}
