'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { SCHEDULE } from '@/lib/config';
import { addDays, dayOfWeek, daysBetween, formatDateLong, formatDateShort, formatTime } from '@/lib/dates';
import type { Slot } from '@/lib/types';
import { Alert, cx, Spinner } from '@/components/ui';

const PAGE = 14;

/** Big tappable day buttons followed by start times. Shared by booking and rescheduling. */
export function DateTimePicker({
  window: win,
  date,
  startMin,
  slots,
  loadingSlots,
  durationMin,
  onDate,
  onTime,
}: {
  window: { first: string; last: string };
  date: string | null;
  startMin: number | null;
  slots: Slot[] | null;
  loadingSlots: boolean;
  durationMin: number;
  onDate: (d: string) => void;
  onTime: (m: number) => void;
}) {
  const [shown, setShown] = useState(PAGE);

  const days = useMemo(() => {
    const out: string[] = [];
    const total = daysBetween(win.first, win.last);
    for (let i = 0; i <= total; i++) {
      const d = addDays(win.first, i);
      if (SCHEDULE.workingDays.includes(dayOfWeek(d))) out.push(d);
    }
    return out;
  }, [win.first, win.last]);

  const anyFree = slots?.some((s) => s.available);

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="flex items-center gap-2 text-xl font-semibold mb-1">
          <CalendarDays className="size-6 text-brand-strong" aria-hidden /> Pick a day
        </legend>
        <p className="text-muted mb-4">We clean Monday to Saturday. The earliest you can book is tomorrow.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {days.slice(0, shown).map((d) => {
            const f = formatDateShort(d);
            const selected = d === date;
            return (
              <button
                key={d}
                type="button"
                onClick={() => onDate(d)}
                aria-pressed={selected}
                aria-label={formatDateLong(d)}
                className={cx(
                  'rounded-xl border-2 py-3 text-center transition-colors',
                  selected ? 'border-brand-strong bg-brand-strong text-white' : 'border-line bg-white hover:border-ink/40',
                )}
              >
                <span className={cx('block text-sm font-medium', selected ? 'text-white/90' : 'text-muted')}>{f.weekday}</span>
                <span className="block text-2xl font-semibold leading-tight">{f.day}</span>
                <span className={cx('block text-sm', selected ? 'text-white/90' : 'text-muted')}>{f.month}</span>
              </button>
            );
          })}
        </div>
        {shown < days.length && (
          <button type="button" onClick={() => setShown((s) => s + PAGE)} className="mt-4 font-semibold text-brand-strong underline underline-offset-4">
            Show later dates
          </button>
        )}
      </fieldset>

      {date && (
        <fieldset className="animate-fade-up">
          <legend className="flex items-center gap-2 text-xl font-semibold mb-1">
            <Clock className="size-6 text-brand-strong" aria-hidden /> Pick an arrival time
          </legend>
          <p className="text-muted mb-4">
            {formatDateLong(date)}. Your clean takes about <strong className="text-ink">{durationMin / 60} hours</strong>.
          </p>
          {loadingSlots || !slots ? (
            <Spinner label="Checking which times are free…" />
          ) : !anyFree ? (
            <Alert tone="warn" title="This day is fully booked">
              Please choose another day.
            </Alert>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {slots.map((s) => {
                const selected = s.startMin === startMin;
                return (
                  <button
                    key={s.startMin}
                    type="button"
                    disabled={!s.available}
                    onClick={() => onTime(s.startMin)}
                    aria-pressed={selected}
                    className={cx(
                      'min-h-14 rounded-xl border-2 px-3 text-lg font-semibold transition-colors',
                      !s.available && 'border-dashed border-line bg-soft text-muted/70 line-through cursor-not-allowed',
                      s.available && (selected ? 'border-brand-strong bg-brand-strong text-white' : 'border-line bg-white hover:border-ink/40'),
                    )}
                  >
                    {formatTime(s.startMin)}
                    {!s.available && <span className="sr-only"> (fully booked)</span>}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>
      )}
    </div>
  );
}
