'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Car, CircleCheck, Clock, KeyRound, MapPin, Navigation, PawPrint, Phone, Play, StickyNote } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatDateLong, formatTimeRange } from '@/lib/dates';
import { ACCESS_LABEL, type BookingStatus, type BookingView, type MeResponse } from '@/lib/types';
import { DateBlock, StatusBadge } from '@/components/BookingBits';
import { PortalShell } from '@/components/portal/PortalShell';
import { Alert, Button, Card, Spinner } from '@/components/ui';

const NEXT_ACTION: Partial<Record<BookingStatus, { to: BookingStatus; label: string; icon: typeof Car }>> = {
  confirmed: { to: 'on_the_way', label: "I'm on my way", icon: Car },
  on_the_way: { to: 'in_progress', label: "I've arrived – start cleaning", icon: Play },
  in_progress: { to: 'completed', label: 'Finished – mark as done', icon: CircleCheck },
};

export function CleanerDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse['user']>(null);
  const [data, setData] = useState<{ today: string; jobs: BookingView[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyRef, setBusyRef] = useState<string | null>(null);

  const load = useCallback(
    () =>
      Promise.all([api<MeResponse>('/api/auth/me'), api<{ today: string; jobs: BookingView[] }>('/api/cleaner/jobs')]).then(
        ([who, jobs]) => {
          setMe(who.user);
          setData(jobs);
          setError(null);
        },
        (e: ApiError) => {
          if (e.status === 401 || e.status === 403) router.replace('/cleaner/login?next=/cleaner');
          else setError(e.message);
        },
      ),
    [router],
  );

  useEffect(() => {
    load();
  }, [load]);

  async function advance(job: BookingView, to: BookingStatus) {
    setBusyRef(job.ref);
    try {
      await api(`/api/cleaner/jobs/${job.ref}`, { method: 'PATCH', body: { status: to } });
      await load();
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusyRef(null);
    }
  }

  if (!data || !me) return error ? <div className="p-8"><Alert tone="error">{error}</Alert></div> : <Spinner label="Loading your jobs…" />;

  const todays = data.jobs.filter((j) => j.date === data.today);
  const later = data.jobs.filter((j) => j.date !== data.today);

  return (
    <PortalShell area="Cleaner" name={me.name}>
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <p className="text-muted text-lg">Hello, {me.name.split(' ')[0]}</p>
        <h1 className="text-4xl font-semibold mt-1">Today, {formatDateLong(data.today)}</h1>

        {error && <Alert tone="error" className="mt-6">{error}</Alert>}

        <section className="mt-8">
          {todays.length === 0 ? (
            <Card className="p-8 text-center text-lg text-muted">No jobs today. Enjoy your day off!</Card>
          ) : (
            <ul className="space-y-5">
              {todays.map((j) => {
                const action = NEXT_ACTION[j.status];
                const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${j.street}, ${j.city}, ${j.postcode}`)}`;
                return (
                  <li key={j.ref}>
                    <Card className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-2xl font-semibold">{formatTimeRange(j.startMin, j.durationMin)}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {j.paymentStatus === 'paid' && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                              Paid in full
                            </span>
                          )}
                          {j.paymentStatus === 'deposit_paid' && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                              Deposit paid (£{(j.depositAmount || 0).toFixed(2)})
                            </span>
                          )}
                          <StatusBadge status={j.status} />
                        </div>
                      </div>
                      <p className="mt-1 text-lg font-medium">{j.serviceTitle}</p>

                      <ul className="mt-4 space-y-3 text-[1.05rem]">
                        <li className="flex items-start gap-3">
                          <MapPin className="size-5 mt-0.5 text-muted shrink-0" aria-hidden />
                          <span>
                            {j.street}, {j.city}, <strong>{j.postcode}</strong>
                          </span>
                        </li>
                        {j.customer && (
                          <li className="flex items-center gap-3">
                            <Phone className="size-5 text-muted shrink-0" aria-hidden />
                            <span>
                              {j.customer.name} ·{' '}
                              <a href={`tel:${j.customer.phone.replace(/[^\d+]/g, '')}`} className="font-semibold text-brand-strong underline underline-offset-4">
                                {j.customer.phone}
                              </a>
                            </span>
                          </li>
                        )}
                        <li className="flex items-start gap-3">
                          <KeyRound className="size-5 mt-0.5 text-muted shrink-0" aria-hidden />
                          <span>
                            {ACCESS_LABEL[j.accessMethod]}
                            {j.accessNotes && <span className="block rounded-lg bg-warn-soft px-3 py-2 mt-1.5">{j.accessNotes}</span>}
                          </span>
                        </li>
                        {j.hasPets && (
                          <li className="flex items-center gap-3">
                            <PawPrint className="size-5 text-muted shrink-0" aria-hidden /> Pets at home
                          </li>
                        )}
                        {j.notes && (
                          <li className="flex items-start gap-3">
                            <StickyNote className="size-5 mt-0.5 text-muted shrink-0" aria-hidden /> {j.notes}
                          </li>
                        )}
                      </ul>

                      <p className="mt-4 rounded-lg bg-soft px-4 py-3">
                          <strong>Rooms:</strong> {j.rooms.bedrooms} bed, {j.rooms.bathrooms} bath, {j.rooms.kitchens} kitchen, {j.rooms.livingRooms} living
                          {j.rooms.extraAreas > 0 && `, ${j.rooms.extraAreas} other`}
                          {j.addons.length > 0 && (
                            <>
                              <br />
                              <strong>Extras:</strong> {j.addons.map((a) => a.name).join(', ')}
                            </>
                          )}
                      </p>

                      <div className="mt-5 flex flex-col sm:flex-row gap-3">
                        {action && (
                          <Button size="lg" className="flex-1" onClick={() => advance(j, action.to)} loading={busyRef === j.ref}>
                            <action.icon className="size-5" aria-hidden /> {action.label}
                          </Button>
                        )}
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-line bg-white px-6 font-semibold hover:border-ink/40">
                          <Navigation className="size-5" aria-hidden /> Directions
                        </a>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Coming up</h2>
          {later.length === 0 ? (
            <Card className="p-6 text-muted">Nothing else booked yet.</Card>
          ) : (
            <Card className="divide-y divide-line">
              {later.map((j) => (
                <div key={j.ref} className="flex items-center gap-4 p-4">
                  <DateBlock date={j.date} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold flex items-center gap-2">
                      <Clock className="size-4 text-muted" aria-hidden /> {formatTimeRange(j.startMin, j.durationMin)}
                    </p>
                    <p>{j.serviceTitle}</p>
                    <p className="text-muted truncate">
                      {j.street}, {j.postcode}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </section>
      </main>
    </PortalShell>
  );
}
