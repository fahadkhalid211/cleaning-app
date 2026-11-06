'use client';

import Link from 'next/link';
import { BRAND } from '@/lib/config';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex-1 flex items-center">
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-20 text-center">
        <h1 className="text-4xl font-semibold">Something went wrong</h1>
        <p className="mt-4 text-lg text-muted">
          Sorry about that. Please try again, or head back home. If it keeps happening, call us on{' '}
          <a href={BRAND.phoneHref} className="font-semibold text-ink underline underline-offset-4">{BRAND.phone}</a>.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button type="button" onClick={reset} className="inline-flex min-h-14 items-center justify-center rounded-full bg-brand-strong px-7 font-semibold text-white">
            Try again
          </button>
          <Link href="/" className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-line px-7 font-semibold">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
