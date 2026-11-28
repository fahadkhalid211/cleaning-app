import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { HostelBookingWizard } from '@/components/hostel/HostelBookingWizard';
import { Spinner } from '@/components/ui';
import { getDictionary, type Locale } from '@/lib/i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.hostelBook.metaTitle,
    description: dict.hostelBook.metaDesc,
    robots: { index: false, follow: false },
  };
}

export default async function HostelBookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale: Locale = locale === 'cn' ? 'cn' : 'en';
  const dict = getDictionary(validLocale);
  const hb = dict.hostelBook;

  return (
    <div className="min-h-screen bg-soft/50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Navigation Breadcrumb / Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/${validLocale}/hostel`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition"
          >
            <ArrowLeft className="size-4" />
            <span>{hb.backToOverview}</span>
          </Link>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-muted">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>{hb.instantConfirm}</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Sparkles className="size-4 text-brand-strong" />
              <span>{hb.liveBunkMap}</span>
            </span>
          </div>
        </div>

        {/* Wizard wrapped in Suspense for useSearchParams support */}
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <Spinner label={hb.loadingMap} />
            </div>
          }
        >
          <HostelBookingWizard />
        </Suspense>
      </div>
    </div>
  );
}
