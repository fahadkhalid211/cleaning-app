'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Clock, Lock, LogOut, MapPin, Phone, Plus, User } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { BRAND, formatMoney, SCHEDULE } from '@/lib/config';
import { formatDateLong, formatTimeRange } from '@/lib/dates';
import { FREQUENCIES } from '@/lib/pricing';
import type { BookingView, MeResponse, Slot } from '@/lib/types';
import { DateBlock, StatusBadge } from '@/components/BookingBits';
import { DateTimePicker } from '@/components/booking/DatePicker';
import { Alert, Button, ButtonLink, Card, Modal, Spinner } from '@/components/ui';

export function CustomerAccount() {
  const router = useRouter();
  const params = useSearchParams();
  const justBooked = params.get('booked');
  const sessionId = params.get('session_id');
  const [me, setMe] = useState<MeResponse['user']>(null);
  const [bookings, setBookings] = useState<BookingView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<BookingView | null>(null);
  const [moving, setMoving] = useState<BookingView | null>(null);

  const load = useCallback(
    () =>
      Promise.all([api<MeResponse>('/api/auth/me'), api<{ bookings: BookingView[] }>('/api/bookings')]).then(
        ([who, list]) => {
          setMe(who.user);
          setBookings(list.bookings);
        },
        (e: ApiError) => {
          if (e.status === 401 || e.status === 403) router.replace('/login?next=/account');
          else setError(e.message);
        },
      ),
    [router],
  );

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.replace('/');
    router.refresh();
  }

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><Alert tone="error">{error}</Alert></div>;
  if (!bookings || !me) return <Spinner label="Loading your bookings…" />;

  const upcoming = bookings.filter((b) => b.status !== 'cancelled' && b.status !== 'completed').sort((a, b) => a.date.localeCompare(b.date) || a.startMin - b.startMin);
  const past = bookings.filter((b) => !upcoming.includes(b));
  const confirmed = justBooked ? bookings.find((b) => b.ref === justBooked) : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-muted text-lg">Hello, {me.name.split(' ')[0]}</p>
          <h1 className="text-4xl font-semibold mt-1">Your bookings</h1>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/book">
            <Plus className="size-5" aria-hidden /> Book a clean
          </ButtonLink>
          <Button variant="secondary" onClick={logout}>
            <LogOut className="size-5" aria-hidden /> Log out
          </Button>
        </div>
      </div>

      {sessionId && (
        <Alert tone="success" title="Payment successful! Your deposit has been received." className="mt-8">
          Your booking is confirmed and secured. We look forward to seeing you!
        </Alert>
      )}
      {confirmed && !sessionId && (
        <Alert tone="success" title="Your booking is confirmed. Thank you!" className="mt-8">
          Your reference is <strong>{confirmed.ref}</strong>. We will see you on {formatDateLong(confirmed.date)} at {formatTimeRange(confirmed.startMin, confirmed.durationMin).split(' – ')[0]}.
        </Alert>
      )}
      {notice && (
        <Alert tone="success" className="mt-8">
          {notice}
        </Alert>
      )}

      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Coming up</h2>
        {upcoming.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-lg text-muted">You have no upcoming cleans.</p>
            <ButtonLink href="/book" className="mt-5">
              Book a clean
            </ButtonLink>
          </Card>
        ) : (
          <ul className="space-y-4">
            {upcoming.map((b) => (
              <li key={b.ref}>
                <BookingCard b={b} onCancel={() => setCancelling(b)} onMove={() => setMoving(b)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Past and cancelled</h2>
          <Card className="divide-y divide-line">
            {past.map((b) => (
              <div key={b.ref} className="flex items-center gap-4 p-4">
                <DateBlock date={b.date} muted />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{b.serviceTitle}</p>
                  <p className="text-muted">{b.street}</p>
                </div>
                <div className="text-right space-y-1">
                  <StatusBadge status={b.status} />
                  <p className="font-semibold">{formatMoney(b.total)}</p>
                </div>
              </div>
            ))}
          </Card>
        </section>
      )}

      <Card className="mt-12 p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="size-6 text-muted" aria-hidden />
          <div>
            <p className="font-semibold">{me.name}</p>
            <p className="text-muted">{me.email}</p>
          </div>
        </div>
        <a href={BRAND.phoneHref} className="inline-flex items-center gap-2 font-semibold">
          <Phone className="size-5 text-brand-strong" aria-hidden /> Need help? {BRAND.phone}
        </a>
      </Card>

      <CancelDialog
        key={`c-${cancelling?.ref}`}
        booking={cancelling}
        onClose={() => setCancelling(null)}
        onDone={(msg) => {
          setCancelling(null);
          setNotice(msg);
          load();
        }}
      />
      <MoveDialog
        key={`m-${moving?.ref}`}
        booking={moving}
        onClose={() => setMoving(null)}
        onDone={(msg) => {
          setMoving(null);
          setNotice(msg);
          load();
        }}
      />
    </div>
  );
}

function BookingCard({ b, onCancel, onMove }: { b: BookingView; onCancel: () => void; onMove: () => void }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex gap-4 sm:gap-5">
        <DateBlock date={b.date} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <h3 className="text-xl font-semibold">{b.serviceTitle}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {b.paymentStatus === 'paid' && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Fully Paid
                </span>
              )}
              {b.paymentStatus === 'deposit_paid' && (
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                  Deposit Paid ({formatMoney(b.depositAmount || 0)})
                </span>
              )}
              {(!b.paymentStatus || b.paymentStatus === 'unpaid') && b.status !== 'cancelled' && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  Deposit Unpaid
                </span>
              )}
              <StatusBadge status={b.status} />
            </div>
          </div>
          <ul className="mt-3 space-y-1.5 text-[1.02rem]">
            <li className="flex items-center gap-2">
              <Clock className="size-5 text-muted shrink-0" aria-hidden /> {formatDateLong(b.date)}, {formatTimeRange(b.startMin, b.durationMin)}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-5 text-muted shrink-0" aria-hidden /> {b.street}, {b.postcode}
            </li>
            {b.cleaner && (
              <li className="flex items-center gap-2">
                <User className="size-5 text-muted shrink-0" aria-hidden /> Your cleaner: {b.cleaner.name}
              </li>
            )}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p>
              <span className="text-2xl font-semibold">{formatMoney(b.total)}</span>
              <span className="text-muted"> · {FREQUENCIES.find((f) => f.id === b.frequency)?.label} · Ref {b.ref}</span>
            </p>
            {b.canChange ? (
              <div className="flex flex-wrap gap-2">
                {(!b.paymentStatus || b.paymentStatus === 'unpaid') && b.status !== 'cancelled' && (
                  <PayDepositButton bookingRef={b.ref} depositAmount={b.depositAmount} />
                )}
                <Button variant="secondary" size="sm" onClick={onMove}>
                  <CalendarClock className="size-4" aria-hidden /> Change date or time
                </Button>
                <Button variant="danger" size="sm" onClick={onCancel}>
                  Cancel booking
                </Button>
              </div>
            ) : (
              b.status === 'confirmed' && <p className="text-muted text-[0.95rem]">Less than {SCHEDULE.changeCutoffHours}h to go. Call us to make changes.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function CancelDialog({ booking, onClose, onDone }: { booking: BookingView | null; onClose: () => void; onDone: (msg: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function confirm() {
    if (!booking) return;
    setBusy(true);
    try {
      await api(`/api/bookings/${booking.ref}`, { method: 'PATCH', body: { action: 'cancel' } });
      onDone(`Your booking on ${formatDateLong(booking.date)} has been cancelled. You have not been charged.`);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal open={!!booking} onClose={onClose} title="Cancel this booking?">
      {booking && (
        <>
          <p className="text-lg">
            {booking.serviceTitle} on <strong>{formatDateLong(booking.date)}</strong> at {formatTimeRange(booking.startMin, booking.durationMin)}.
          </p>
          <p className="mt-2 text-muted">There is no charge for cancelling.</p>
          {error && <Alert tone="error" className="mt-4">{error}</Alert>}
          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              No, keep it
            </Button>
            <Button variant="primary" className="!bg-danger hover:!bg-danger/90" onClick={confirm} loading={busy}>
              Yes, cancel booking
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function MoveDialog({ booking, onClose, onDone }: { booking: BookingView | null; onClose: () => void; onDone: (msg: string) => void }) {
  const [win, setWin] = useState<{ first: string; last: string } | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [startMin, setStartMin] = useState<number | null>(null);
  // Bumped after a failed move so the times are fetched again.
  const [refresh, setRefresh] = useState(0);
  const [slotState, setSlotState] = useState<{ key: string; slots: Slot[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slotKey = booking && date ? `${booking.ref}|${date}|${refresh}` : null;
  const slots = slotState && slotState.key === slotKey ? slotState.slots : null;

  useEffect(() => {
    if (booking && !win) api<{ bookable: { first: string; last: string } }>('/api/catalog').then((c) => setWin(c.bookable), () => {});
  }, [booking, win]);

  useEffect(() => {
    if (!slotKey || !booking || !date) return;
    let cancelled = false;
    api<{ slots: Slot[] }>('/api/availability', { body: { date, ref: booking.ref } }).then(
      (r) => !cancelled && setSlotState({ key: slotKey, slots: r.slots }),
      (e: ApiError) => !cancelled && setError(e.message),
    );
    return () => {
      cancelled = true;
    };
  }, [slotKey, booking, date]);

  async function confirm() {
    if (!booking || !date || startMin === null) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/bookings/${booking.ref}`, { method: 'PATCH', body: { action: 'reschedule', date, startMin } });
      onDone(`Done. Your clean is now on ${formatDateLong(date)} at ${formatTimeRange(startMin, booking.durationMin).split(' – ')[0]}.`);
    } catch (e) {
      setError((e as ApiError).message);
      setStartMin(null);
      setRefresh((n) => n + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!booking} onClose={onClose} title="Choose a new date and time" wide>
      {booking && win ? (
        <div className="max-h-[70vh] overflow-y-auto -mx-1 px-1">
          <DateTimePicker
            window={win}
            date={date}
            startMin={startMin}
            slots={slots}
            loadingSlots={!slots}
            durationMin={booking.durationMin}
            onDate={(d) => {
              setDate(d);
              setStartMin(null);
            }}
            onTime={setStartMin}
          />
          {error && <Alert tone="error" className="mt-4">{error}</Alert>}
          <div className="sticky bottom-0 bg-white pt-4 mt-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Keep current time
            </Button>
            <Button onClick={confirm} loading={busy} disabled={!date || startMin === null}>
              Move my booking
            </Button>
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </Modal>
  );
}

function PayDepositButton({ bookingRef, depositAmount }: { bookingRef: string; depositAmount?: number }) {
  const [busy, setBusy] = useState(false);
  async function onPay() {
    setBusy(true);
    try {
      const res = await api<{ checkoutUrl: string }>(`/api/bookings/${bookingRef}/checkout`, { method: 'POST' });
      if (res.checkoutUrl) window.location.href = res.checkoutUrl;
    } catch (err) {
      setBusy(false);
      alert((err as ApiError).message);
    }
  }
  return (
    <Button variant="primary" size="sm" onClick={onPay} loading={busy}>
      <Lock className="size-3.5" aria-hidden /> Pay deposit {depositAmount ? `(${formatMoney(depositAmount)})` : ''}
    </Button>
  );
}
