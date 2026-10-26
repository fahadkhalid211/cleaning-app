import type { Metadata } from 'next';
import { CleanerAuth } from '@/components/auth/CleanerAuth';

export const metadata: Metadata = {
  title: 'Cleaner log in & registration',
  description: 'Log in to your cleaner account or apply to join our cleaning team.',
  robots: { index: false },
};

export default function CleanerLoginPage() {
  return <CleanerAuth initialTab="login" />;
}
