import type { Metadata } from 'next';
import { CleanerDashboard } from './CleanerDashboard';

export const metadata: Metadata = { title: 'My jobs', robots: { index: false } };

export default function CleanerPage() {
  return <CleanerDashboard />;
}
