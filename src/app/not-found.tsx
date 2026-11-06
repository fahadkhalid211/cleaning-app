import type { Metadata } from 'next';
import { Phone } from 'lucide-react';
import { BRAND } from '@/lib/config';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { ButtonLink } from '@/components/ui';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex items-center">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-strong">Error 404</p>
          <h1 className="mt-3 text-4xl font-semibold">We can&apos;t find that page</h1>
          <p className="mt-4 text-lg text-muted">
            The link may be old or mistyped. Nothing is wrong with your booking. Pick where you&apos;d like to go next.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <ButtonLink href="/" size="lg">Back to home</ButtonLink>
            <ButtonLink href="/book" size="lg" variant="secondary">Book a clean</ButtonLink>
            <ButtonLink href="/account" size="lg" variant="secondary">My bookings</ButtonLink>
          </div>
          <p className="mt-8 text-muted">
            Need a hand?{' '}
            <a href={BRAND.phoneHref} className="inline-flex items-center gap-1.5 font-semibold text-ink underline underline-offset-4">
              <Phone className="size-4" aria-hidden /> {BRAND.phone}
            </a>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
