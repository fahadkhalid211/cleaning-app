import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CleanerDashboard } from './CleanerDashboard';

export const metadata: Metadata = { title: 'My jobs', robots: { index: false } };

export default function CleanerPage() {
  return (
    <Suspense>
      <CleanerDashboard />
    </Suspense>
  );
}
