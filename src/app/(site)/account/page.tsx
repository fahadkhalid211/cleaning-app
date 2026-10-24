import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui';
import { CustomerAccount } from './CustomerAccount';

export const metadata: Metadata = { title: 'My bookings', robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="bg-soft/60 min-h-full">
      <Suspense fallback={<Spinner />}>
        <CustomerAccount />
      </Suspense>
    </div>
  );
}
