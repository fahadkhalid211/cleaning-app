'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, CalendarDays, MapPin, Moon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (s: string, n: number) => {
  const d = new Date(`${s}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
};

/** Big yellow "where / when / book" bar, in the spirit of city-hostel booking widgets. */
export function HostelSearchBar({ ctaLabel, locationLabel }: { ctaLabel: string; locationLabel: string }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const today = iso(new Date());
  const [checkIn, setCheckIn] = useState(() => addDays(today, 1));
  const [checkOut, setCheckOut] = useState(() => addDays(today, 2));
  const nights = Math.max(1, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000));

  function go(e: React.FormEvent) {
    e.preventDefault();
    const qs = new URLSearchParams({ checkIn, checkOut });
    router.push(`/${locale}/hostel/book?${qs}`);
  }

  const field =
    'w-full bg-transparent text-lg font-bold text-ink outline-none [color-scheme:light] cursor-pointer';

  return (
    <form
      onSubmit={go}
      className="text-ink rounded-[2rem] bg-hostel p-3 sm:p-4 shadow-[0_20px_50px_rgb(0_0_0/0.35)] grid gap-2 sm:gap-3 md:grid-cols-[1fr_1fr_1fr_auto] items-stretch"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3">
        <MapPin className="size-5 shrink-0" aria-hidden />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink/60">{locale === 'cn' ? '地点' : 'Location'}</p>
          <p className="text-lg font-bold">{locationLabel}</p>
        </div>
      </div>
      <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
        <CalendarDays className="size-5 shrink-0" aria-hidden />
        <span className="flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-ink/60">{t.hostelBook.dates.checkIn}</span>
          <input
            type="date"
            required
            min={today}
            value={checkIn}
            onChange={(e) => {
              const v = e.target.value;
              setCheckIn(v);
              if (v && v >= checkOut) setCheckOut(addDays(v, 1));
            }}
            className={field}
          />
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
        <Moon className="size-5 shrink-0" aria-hidden />
        <span className="flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-ink/60">
            {t.hostelBook.dates.checkOut} · {t.hostelBook.dates.nightsCount(nights)}
          </span>
          <input
            type="date"
            required
            min={addDays(checkIn, 1)}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={field}
          />
        </span>
      </label>
      <button
        type="submit"
        className="inline-flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-ink px-8 text-lg font-extrabold italic uppercase tracking-tight text-hostel transition hover:bg-black"
      >
        {ctaLabel} <ArrowRight className="size-5 not-italic" aria-hidden />
      </button>
    </form>
  );
}
