// Class helpers with no React or browser code, so server components can use them too.

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
export type Size = 'md' | 'lg' | 'sm';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-strong text-white hover:bg-brand-deep shadow-sm',
  secondary: 'bg-white text-ink border-2 border-line hover:border-ink/40',
  ghost: 'text-ink hover:bg-soft',
  danger: 'bg-white text-danger border-2 border-danger/30 hover:bg-danger-soft',
  dark: 'bg-ink text-white hover:bg-black',
};

const SIZES: Record<Size, string> = {
  sm: 'min-h-10 px-4 text-[0.95rem]',
  md: 'min-h-12 px-6 text-base',
  lg: 'min-h-14 px-8 text-lg',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra?: string) {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none',
    VARIANTS[variant],
    SIZES[size],
    extra,
  );
}

