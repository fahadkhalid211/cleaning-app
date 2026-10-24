'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Eye, EyeOff, Info, LoaderCircle, Minus, Plus, X } from 'lucide-react';

import { buttonClass, cx, type Size, type Variant } from './styles';

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...rest
}: ComponentProps<'button'> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button {...rest} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClass(variant, size, className)}>
      {loading && <LoaderCircle className="size-5 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = 'primary', size = 'md', className, ...rest }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link {...rest} className={buttonClass(variant, size, className)} />;
}

export function Card({ className, ...rest }: ComponentProps<'div'>) {
  return <div {...rest} className={cx('rounded-card bg-white border border-line shadow-card', className)} />;
}

const inputClass = (invalid?: boolean) =>
  cx(
    'w-full min-h-13 rounded-[10px] border-2 bg-white px-4 text-base text-ink placeholder:text-muted/70 transition-colors',
    'focus:outline-none focus:border-brand-strong focus:ring-4 focus:ring-brand-soft',
    invalid ? 'border-danger' : 'border-line hover:border-ink/30',
  );

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
}

export function TextField({ label, hint, error, optional, className, type, ...rest }: FieldProps & ComponentProps<'input'>) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-semibold mb-1.5">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-[0.95rem] text-muted mb-2">
          {hint}
        </p>
      )}
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={!!error || undefined}
          aria-describedby={cx(hint && `${id}-hint`, error && `${id}-err`) || undefined}
          className={cx(inputClass(!!error), isPassword && 'pr-24')}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.95rem] font-semibold text-ink hover:bg-soft"
          >
            {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <FieldError id={`${id}-err`}>{error}</FieldError>}
    </div>
  );
}

export function TextArea({ label, hint, error, optional, className, ...rest }: FieldProps & ComponentProps<'textarea'>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-semibold mb-1.5">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {hint && <p className="text-[0.95rem] text-muted mb-2">{hint}</p>}
      <textarea id={id} aria-invalid={!!error || undefined} className={cx(inputClass(!!error), 'py-3 min-h-28')} {...rest} />
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p id={id} role="alert" className="mt-2 flex items-start gap-1.5 text-danger font-medium">
      <CircleAlert className="size-5 shrink-0 mt-0.5" aria-hidden />
      {children}
    </p>
  );
}

export function Alert({ tone = 'info', title, children, className }: { tone?: 'info' | 'success' | 'error' | 'warn'; title?: string; children?: ReactNode; className?: string }) {
  const styles = {
    info: 'bg-soft border-line text-ink',
    success: 'bg-success-soft border-success/25 text-ink',
    error: 'bg-danger-soft border-danger/25 text-ink',
    warn: 'bg-warn-soft border-warn/25 text-ink',
  }[tone];
  const Icon = tone === 'success' ? CircleCheck : tone === 'error' || tone === 'warn' ? CircleAlert : Info;
  const iconColor = { info: 'text-ink', success: 'text-success', error: 'text-danger', warn: 'text-warn' }[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('flex gap-3 rounded-card border p-4', styles, className)}>
      <Icon className={cx('size-6 shrink-0', iconColor)} aria-hidden />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 text-[0.98rem]' : ''}>{children}</div>}
      </div>
    </div>
  );
}

/** Big −/+ counter. Easier than typing numbers, especially on phones. */
export function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  const btn = 'size-12 shrink-0 rounded-full border-2 border-line flex items-center justify-center hover:border-ink/40 disabled:opacity-35 disabled:hover:border-line';
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="font-medium text-lg">{label}</span>
      <div className="flex items-center gap-3" role="group" aria-label={label}>
        <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          <Minus className="size-5" aria-hidden />
        </button>
        <output aria-live="polite" className="w-8 text-center text-xl font-semibold tabular-nums">
          {value}
        </output>
        <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>
          <Plus className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'brand' | 'success' | 'danger' | 'warn' | 'dark'; children: ReactNode }) {
  const styles = {
    neutral: 'bg-sand text-ink',
    brand: 'bg-brand-soft text-brand-deep',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
    warn: 'bg-warn-soft text-warn',
    dark: 'bg-ink text-white',
  }[tone];
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.85rem] font-semibold whitespace-nowrap', styles)}>{children}</span>;
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-muted" role="status">
      <LoaderCircle className="size-6 animate-spin" aria-hidden />
      <span className="text-lg">{label}</span>
    </div>
  );
}

/** Accessible modal built on <dialog>: focus trap, Esc to close, background inert. */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cx('m-auto w-[calc(100%-2rem)] rounded-2xl p-0 shadow-pop backdrop:bg-ink/50 open:animate-fade-up', wide ? 'max-w-3xl' : 'max-w-lg')}
    >
      {open && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="rounded-full p-2 -m-2 hover:bg-soft" aria-label="Close">
              <X className="size-6" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export { buttonClass, cx };
