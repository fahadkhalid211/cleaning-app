import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowLeft, Bed, ShieldCheck, Sparkles } from 'lucide-react';
import { BRAND } from '@/lib/config';
import { HostelBookingWizard } from '@/components/hostel/HostelBookingWizard';
import { Spinner } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Choose Your Bed & Book | Interactive London Hostel Floorplan',
  description:
    'Select your exact bunk bed or pod in our Central London hostel. Interactive floorplan, upper/lower tier selection, add-on options, and secure PayPal deposit.',
  openGraph: {
    title: 'Interactive Bunk Bed Booking | Choose Your Bed on Live Map',
    description:
      'Airline-style interactive seat selection for London bunk beds. Pick your room, tier, and bed with live availability and instant confirmation.',
    url: `${BRAND.url}/hostel/book`,
    siteName: BRAND.name,
    locale: 'en_GB',
  },
  alternates: {
    canonical: `${BRAND.url}/hostel/book`,
  },
};

export default function HostelBookPage() {
  return (
    <div className="min-h-screen bg-soft/50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Navigation Breadcrumb / Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/hostel"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink transition"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Hostel Overview</span>
          </Link>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-muted">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Instant Confirmation</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Sparkles className="size-4 text-brand-strong" />
              <span>Live Graphical Bunk Map</span>
            </span>
          </div>
        </div>

        {/* Wizard wrapped in Suspense for useSearchParams support */}
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <Spinner label="Loading interactive bunk bed map and rooms..." />
            </div>
          }
        >
          <HostelBookingWizard />
        </Suspense>
      </div>
    </div>
  );
}
