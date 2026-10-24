import { BedDouble, Hammer, KeyRound, ShieldCheck, Sparkles, type LucideProps } from 'lucide-react';

const ICONS = { Sparkles, ShieldCheck, KeyRound, BedDouble, Hammer };

export function ServiceIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? Sparkles;
  return <Icon aria-hidden {...props} />;
}
