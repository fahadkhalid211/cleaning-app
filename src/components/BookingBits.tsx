import { formatDateShort } from '@/lib/dates';
import { STATUS_LABEL, type BookingStatus } from '@/lib/types';
import { Badge } from '@/components/ui';

export function StatusBadge({ status }: { status: BookingStatus }) {
  const tone = ({ confirmed: 'brand', on_the_way: 'warn', in_progress: 'warn', completed: 'success', cancelled: 'neutral' } as const)[status];
  return <Badge tone={tone}>{STATUS_LABEL[status]}</Badge>;
}

/** Calendar-page style date block, easy to scan in a list. */
export function DateBlock({ date, muted }: { date: string; muted?: boolean }) {
  const f = formatDateShort(date);
  return (
    <div className={`flex w-18 shrink-0 flex-col items-center rounded-xl py-2.5 ${muted ? 'bg-soft text-muted' : 'bg-brand-tint text-brand-deep'}`}>
      <span className="text-sm font-semibold uppercase">{f.weekday}</span>
      <span className="text-3xl font-semibold leading-none my-0.5">{f.day}</span>
      <span className="text-sm">{f.month}</span>
    </div>
  );
}
