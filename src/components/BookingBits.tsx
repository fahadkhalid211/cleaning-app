import { formatDateShort } from '@/lib/dates';
import { STATUS_LABEL, type BookingStatus } from '@/lib/types';
import { Badge } from '@/components/ui';

export function StatusBadge({ status, locale }: { status: BookingStatus; locale?: string }) {
  const tone = ({ confirmed: 'brand', on_the_way: 'warn', in_progress: 'warn', completed: 'success', cancelled: 'neutral' } as const)[status];
  const label =
    locale === 'cn'
      ? {
          confirmed: '已确认',
          on_the_way: '在途中',
          in_progress: '保洁中',
          completed: '已完成',
          cancelled: '已取消',
        }[status] || STATUS_LABEL[status]
      : STATUS_LABEL[status];
  return <Badge tone={tone}>{label}</Badge>;
}

/** Calendar-page style date block, easy to scan in a list. */
export function DateBlock({ date, muted, locale }: { date: string; muted?: boolean; locale?: string }) {
  const f = formatDateShort(date);
  const weekday =
    locale === 'cn'
      ? {
          Sun: '周日',
          Mon: '周一',
          Tue: '周二',
          Wed: '周三',
          Thu: '周四',
          Fri: '周五',
          Sat: '周六',
        }[f.weekday] || f.weekday
      : f.weekday;
  const month =
    locale === 'cn'
      ? {
          Jan: '1月',
          Feb: '2月',
          Mar: '3月',
          Apr: '4月',
          May: '5月',
          Jun: '6月',
          Jul: '7月',
          Aug: '8月',
          Sep: '9月',
          Oct: '10月',
          Nov: '11月',
          Dec: '12月',
        }[f.month] || f.month
      : f.month;
  return (
    <div className={`flex w-18 shrink-0 flex-col items-center rounded-xl py-2.5 ${muted ? 'bg-soft text-muted' : 'bg-brand-tint text-brand-deep'}`}>
      <span className="text-sm font-semibold uppercase">{weekday}</span>
      <span className="text-3xl font-semibold leading-none my-0.5">{f.day}</span>
      <span className="text-sm">{month}</span>
    </div>
  );
}
