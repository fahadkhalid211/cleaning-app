import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CustomerAuth } from './CustomerAuth';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <div className="bg-cream/50 py-12 sm:py-20 px-4">
      <Suspense>
        <CustomerAuth />
      </Suspense>
    </div>
  );
}
