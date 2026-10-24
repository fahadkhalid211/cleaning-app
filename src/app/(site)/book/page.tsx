import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { Spinner } from '@/components/ui';

export const metadata: Metadata = { title: 'Book a clean' };

export default function BookPage() {
  return (
    <div className="bg-soft/60 min-h-full">
      <Suspense fallback={<Spinner label="Loading booking form…" />}>
        <BookingWizard />
      </Suspense>
    </div>
  );
}
