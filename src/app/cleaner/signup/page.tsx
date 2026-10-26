import type { Metadata } from 'next';
import { CleanerAuth } from '@/components/auth/CleanerAuth';

export const metadata: Metadata = {
  title: 'Apply to clean with us | Cleaner registration',
  description: 'Sign up to become a cleaner and start getting cleaning bookings.',
  robots: { index: false },
};

export default function CleanerSignupPage() {
  return <CleanerAuth initialTab="register" />;
}
