'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  Bed,
  Calendar,
  CalendarClock,
  Clock,
  Lock,
  LogOut,
  MapPin,
  Moon,
  Phone,
  Plus,
  Sparkles,
  User,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { BRAND, formatMoney, SCHEDULE } from '@/lib/config';
import { formatDateLong, formatTimeRange } from '@/lib/dates';
import { FREQUENCIES } from '@/lib/pricing';
import type { BookingView, HostelBookingView, MeResponse, Slot } from '@/lib/types';
import { DateBlock, StatusBadge } from '@/components/BookingBits';
import { DateTimePicker } from '@/components/booking/DatePicker';
import { Alert, Badge, Button, ButtonLink, Card, Modal, Spinner } from '@/components/ui';

export function CustomerAccount() {
  const router = useRouter();
  const params = useSearchParams();
  const justBooked = params.get('booked');
  const paid = params.get('paid');
  const payment = params.get('payment');
  const [me, setMe] = useState<MeResponse['user']>(null);
  const [bookings, setBookings] = useState<BookingView[] | null>(null);
  const [hostelBookings, setHostelBookings] = useState<HostelBookingView[] | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'hostel' | 'cleaning'>('all');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<BookingView | null>(null);
  const [cancellingHostel, setCancellingHostel] = useState<HostelBookingView | null>(null);
  const [moving, setMoving] = useState<BookingView | null>(null);

  const load = useCallback(
    () =>
      Promise.all([
        api<MeResponse>('/api/auth/me'),
        api<{ bookings: BookingView[] }>('/api/bookings'),
        api<{ bookings: HostelBookingView[] }>('/api/hostel/bookings').catch(() => ({ bookings: [] })),
      ]).then(
        ([who, list, hostelList]) => {
          setMe(who.user);
          setBookings(list.bookings || []);
          setHostelBookings(hostelList.bookings || []);

          if (justBooked?.startsWith('HDH-')) {
            setActiveTab('hostel');
          }
        },
        (e: ApiError) => {
          if (e.status === 401 || e.status === 403) router.replace('/login?next=/account');
          else setError(e.message);
        },
      ),
    [router, justBooked],
  );

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.replace('/');
    router.refresh();
  }

  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Alert tone="error">{error}</Alert>
      </div>
    );
  if (!bookings || !hostelBookings || !me) return <Spinner label="Loading your bookings…" />;

  // Cleaning bookings categorization
  const upcomingCleans = bookings
    .filter((b) => b.status !== 'cancelled' && b.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date) || a.startMin - b.startMin);
  const pastCleans = bookings.filter((b) => !upcomingCleans.includes(b));

  // Hostel bookings categorization
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingHostel = hostelBookings
    .filter((h) => h.status !== 'cancelled' && h.checkOut >= todayStr)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const pastHostel = hostelBookings.filter((h) => !upcomingHostel.includes(h));

  const confirmedClean = justBooked && !justBooked.startsWith('HDH-') ? bookings.find((b) => b.ref === justBooked) : undefined;
  const confirmedHostel = justBooked && justBooked.startsWith('HDH-') ? hostelBookings.find((h) => h.ref === justBooked) : undefined;

  const totalUpcoming = upcomingCleans.length + upcomingHostel.length;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
      {/* Top Banner & User Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-muted text-lg">Hello, {me.name.split(' ')[0]}</p>
          <h1 className="text-4xl font-bold tracking-tight text-ink mt-1">Your bookings & stays</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/hostel/book" className="bg-brand text-white">
            <Bed className="size-4" aria-hidden /> Book a bunk bed
          </ButtonLink>
          <ButtonLink href="/book" variant="secondary">
            <Plus className="size-4" aria-hidden /> Book a clean
          </ButtonLink>
          <Button variant="secondary" onClick={logout}>
            <LogOut className="size-4" aria-hidden /> Log out
          </Button>
        </div>
      </div>

      {/* Payment / Confirmation Alerts */}
      {payment === 'cancelled' && (
        <Alert tone="error" title="Payment not completed" className="mt-8">
          Your reservation is saved but the deposit hasn&apos;t been paid yet. Use &quot;Pay deposit&quot; below to complete it with PayPal.
        </Alert>
      )}
      {payment === 'failed' && (
        <Alert tone="error" title="We couldn't confirm your payment" className="mt-8">
          If PayPal charged you, it will be matched to your booking automatically within a few minutes. Otherwise, use &quot;Pay deposit&quot; below to try again.
        </Alert>
      )}
      {paid && (
        <Alert tone="success" title="Payment successful! Your deposit has been received." className="mt-8">
          Your reservation is confirmed and secured with PayPal. We look forward to hosting you!
        </Alert>
      )}
      {confirmedClean && !paid && !payment && (
        <Alert tone="success" title="Your cleaning booking is confirmed. Thank you!" className="mt-8">
          Your reference is <strong>{confirmedClean.ref}</strong>. We will see you on {formatDateLong(confirmedClean.date)} at{' '}
          {formatTimeRange(confirmedClean.startMin, confirmedClean.durationMin).split(' – ')[0]}.
        </Alert>
      )}
      {confirmedHostel && !paid && !payment && (
        <Alert tone="success" title="Your hostel stay is confirmed. Thank you!" className="mt-8">
          Your reference is <strong>{confirmedHostel.ref}</strong>. Room: <strong>{confirmedHostel.roomName}</strong>, Bed:{' '}
          <strong>{confirmedHostel.bedLabel}</strong>. Check-in: {formatDateLong(confirmedHostel.checkIn)} (15:00 onwards).
        </Alert>
      )}
      {notice && (
        <Alert tone="success" className="mt-8">
          {notice}
        </Alert>
      )}

      {/* Filter Tabs */}
      <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-line pb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'all'
              ? 'bg-ink text-white shadow-sm'
              : 'bg-soft text-muted hover:text-ink hover:bg-slate-200'
          }`}
        >
          All Bookings ({totalUpcoming})
        </button>
        <button
          onClick={() => setActiveTab('hostel')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'hostel'
              ? 'bg-brand text-white shadow-sm'
              : 'bg-soft text-muted hover:text-ink hover:bg-slate-200'
          }`}
        >
          <Bed className="size-4" />
          <span>Hostel Stays ({upcomingHostel.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('cleaning')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'cleaning'
              ? 'bg-brand text-white shadow-sm'
              : 'bg-soft text-muted hover:text-ink hover:bg-slate-200'
          }`}
        >
          <Sparkles className="size-4" />
          <span>Cleaning Services ({upcomingCleans.length})</span>
        </button>
      </div>

      {/* UPCOMING SECTION */}
      <section className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold text-ink">Upcoming reservations</h2>

        {/* When active tab includes Hostel */}
        {(activeTab === 'all' || activeTab === 'hostel') && upcomingHostel.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Bed className="size-5 text-brand-strong" />
              <span>Hostel & Bunk Bed Stays</span>
            </h3>
            <ul className="space-y-4">
              {upcomingHostel.map((h) => (
                <li key={h.ref}>
                  <HostelBookingCard h={h} onCancel={() => setCancellingHostel(h)} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* When active tab includes Cleaning */}
        {(activeTab === 'all' || activeTab === 'cleaning') && upcomingCleans.length > 0 && (
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Sparkles className="size-5 text-brand-strong" />
              <span>Home Cleaning Services</span>
            </h3>
            <ul className="space-y-4">
              {upcomingCleans.map((b) => (
                <li key={b.ref}>
                  <BookingCard b={b} onCancel={() => setCancelling(b)} onMove={() => setMoving(b)} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'all' && totalUpcoming === 0 && (
          <Card className="p-10 text-center space-y-4">
            <p className="text-lg text-muted">You have no upcoming bookings or stays.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/hostel/book">
                <Bed className="size-4" /> Book a bunk bed
              </ButtonLink>
              <ButtonLink href="/book" variant="secondary">
                <Plus className="size-4" /> Book a clean
              </ButtonLink>
            </div>
          </Card>
        )}

        {activeTab === 'hostel' && upcomingHostel.length === 0 && (
          <Card className="p-10 text-center space-y-4">
            <p className="text-lg text-muted">You have no upcoming hostel stays.</p>
            <div>
              <ButtonLink href="/hostel/book">
                <Bed className="size-4" /> Choose your bed on live map
              </ButtonLink>
            </div>
          </Card>
        )}

        {activeTab === 'cleaning' && upcomingCleans.length === 0 && (
          <Card className="p-10 text-center space-y-4">
            <p className="text-lg text-muted">You have no upcoming home cleans.</p>
            <div>
              <ButtonLink href="/book">
                <Plus className="size-4" /> Book a clean
              </ButtonLink>
            </div>
          </Card>
        )}
      </section>

      {/* PAST & CANCELLED SECTION */}
      {(pastCleans.length > 0 || pastHostel.length > 0) && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-ink mb-4">Past and cancelled</h2>
          <Card className="divide-y divide-line">
            {pastHostel.map((h) => (
              <div key={h.ref} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand-strong shrink-0">
                    <Bed className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{h.roomName}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        Bed {h.bedLabel}
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-0.5">
                      {formatDateLong(h.checkIn)} – {formatDateLong(h.checkOut)} ({h.nights} nights) · Ref {h.ref}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center justify-between sm:flex-col sm:items-end gap-2">
                  <HostelStatusBadge status={h.status} />
                  <p className="font-bold text-ink">{formatMoney(h.total)}</p>
                </div>
              </div>
            ))}

            {pastCleans.map((b) => (
              <div key={b.ref} className="flex items-center gap-4 p-5">
                <DateBlock date={b.date} muted />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">{b.serviceTitle}</p>
                  <p className="text-sm text-muted">
                    {b.street} · Ref {b.ref}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <StatusBadge status={b.status} />
                  <p className="font-semibold text-ink">{formatMoney(b.total)}</p>
                </div>
              </div>
            ))}
          </Card>
        </section>
      )}

      {/* User Info Footer Card */}
      <Card className="mt-12 p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-soft">
            <User className="size-6 text-muted" aria-hidden />
          </div>
          <div>
            <p className="font-bold text-ink">{me.name}</p>
            <p className="text-sm text-muted">{me.email}</p>
          </div>
        </div>
        <a href={BRAND.phoneHref} className="inline-flex items-center gap-2 font-semibold text-brand-strong hover:underline">
          <Phone className="size-5" aria-hidden /> 24/7 Front Desk: {BRAND.phone}
        </a>
      </Card>

      {/* Cancellation Dialogs */}
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
      <CancelHostelDialog
        key={`ch-${cancellingHostel?.ref}`}
        booking={cancellingHostel}
        onClose={() => setCancellingHostel(null)}
        onDone={(msg) => {
          setCancellingHostel(null);
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

// ---------------------------------------------------------------------------
// Hostel Booking Card
// ---------------------------------------------------------------------------

function HostelBookingCard({ h, onCancel }: { h: HostelBookingView; onCancel: () => void }) {
  const roomTypeLabel = {
    mixed: 'Mixed Dorm',
    female: 'Female-Only Dorm',
    male: 'Male-Only Dorm',
    deluxe: 'Deluxe Capsule Pod',
  }[h.roomType];

  return (
    <Card className="p-6 transition hover:border-brand/40 shadow-sm">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand-strong shrink-0">
          <Bed className="size-7" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-ink">{h.roomName}</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                  {roomTypeLabel}
                </span>
              </div>
              <p className="text-sm text-brand-strong font-bold mt-0.5">
                Bed {h.bedLabel} · {h.tier === 'top' ? 'Upper Bunk' : 'Lower Bunk / Pod'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {h.paymentStatus === 'paid' && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  ✓ Fully Paid
                </span>
              )}
              {h.paymentStatus === 'deposit_paid' && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                  Deposit Paid ({formatMoney(h.depositAmount)})
                </span>
              )}
              {h.paymentStatus === 'unpaid' && h.status !== 'cancelled' && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  Deposit Unpaid
                </span>
              )}
              <HostelStatusBadge status={h.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-sm">
            <div className="space-y-1.5">
              <p className="flex items-center gap-2 text-slate-700">
                <Calendar className="size-4 text-muted shrink-0" />
                <span>
                  <strong>Check-in:</strong> {formatDateLong(h.checkIn)} (from 15:00)
                </span>
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <CalendarClock className="size-4 text-muted shrink-0" />
                <span>
                  <strong>Check-out:</strong> {formatDateLong(h.checkOut)} (by 11:00)
                </span>
              </p>
              <p className="text-xs text-muted pl-6">Duration: {h.nights} night(s)</p>
            </div>

            <div className="space-y-1.5">
              <p className="flex items-center gap-2 text-slate-700">
                <User className="size-4 text-muted shrink-0" />
                <span>
                  Guest: <strong>{h.guestName}</strong> ({h.guestPhone})
                </span>
              </p>
              {h.addons && h.addons.length > 0 && (
                <p className="text-xs text-slate-600 pl-6">
                  Add-ons: {h.addons.map((a) => a.name).join(', ')}
                </p>
              )}
              <p className="text-xs text-muted pl-6">Booking Ref: <strong>{h.ref}</strong></p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line">
            <div>
              <span className="text-2xl font-black text-ink">{formatMoney(h.total)}</span>
              {h.paymentStatus === 'deposit_paid' && (
                <span className="text-xs text-muted block">
                  Remaining balance of {formatMoney(h.total - h.depositAmount)} due at check-in
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {h.paymentStatus === 'unpaid' && h.status !== 'cancelled' && (
                <PayDepositButton bookingRef={h.ref} depositAmount={h.depositAmount} />
              )}
              {h.status !== 'cancelled' && (
                <Button variant="danger" size="sm" onClick={onCancel}>
                  Cancel Stay
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function HostelStatusBadge({ status }: { status: HostelBookingView['status'] }) {
  if (status === 'confirmed') {
    return <Badge tone="brand">Confirmed</Badge>;
  }
  if (status === 'checked_in') {
    return <Badge tone="success">Checked In</Badge>;
  }
  if (status === 'checked_out') {
    return <Badge tone="neutral">Checked Out</Badge>;
  }
  return <Badge tone="neutral">Cancelled</Badge>;
}

// ---------------------------------------------------------------------------
// Cleaning Booking Card
// ---------------------------------------------------------------------------

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
              <Clock className="size-5 text-muted shrink-0" aria-hidden /> {formatDateLong(b.date)},{' '}
              {formatTimeRange(b.startMin, b.durationMin)}
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
              <span className="text-muted">
                {' '}
                · {FREQUENCIES.find((f) => f.id === b.frequency)?.label} · Ref {b.ref}
              </span>
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
              b.status === 'confirmed' && (
                <p className="text-muted text-[0.95rem]">
                  Less than {SCHEDULE.changeCutoffHours}h to go. Call us to make changes.
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Dialogs & Buttons
// ---------------------------------------------------------------------------

function CancelHostelDialog({
  booking,
  onClose,
  onDone,
}: {
  booking: HostelBookingView | null;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (!booking) return;
    setBusy(true);
    try {
      await api(`/api/hostel/bookings/${booking.ref}`, { method: 'PATCH', body: { action: 'cancel' } });
      onDone(`Your stay for Bed ${booking.bedLabel} (${booking.roomName}) has been cancelled.`);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!booking} onClose={onClose} title="Cancel this hostel stay?">
      {booking && (
        <>
          <p className="text-lg">
            {booking.roomName} · <strong>Bed {booking.bedLabel}</strong>
          </p>
          <p className="mt-1 text-muted">
            {formatDateLong(booking.checkIn)} to {formatDateLong(booking.checkOut)} ({booking.nights} night(s)).
          </p>
          <p className="mt-3 text-sm text-muted">
            Free cancellation before your scheduled arrival date. If a deposit was already paid via PayPal, please contact reception if you require assistance.
          </p>
          {error && <Alert tone="error" className="mt-4">{error}</Alert>}
          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              No, keep it
            </Button>
            <Button variant="primary" className="!bg-danger hover:!bg-danger/90" onClick={confirm} loading={busy}>
              Yes, cancel stay
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function CancelDialog({
  booking,
  onClose,
  onDone,
}: {
  booking: BookingView | null;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
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
            {booking.serviceTitle} on <strong>{formatDateLong(booking.date)}</strong> at{' '}
            {formatTimeRange(booking.startMin, booking.durationMin)}.
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

function MoveDialog({
  booking,
  onClose,
  onDone,
}: {
  booking: BookingView | null;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [win, setWin] = useState<{ first: string; last: string } | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [startMin, setStartMin] = useState<number | null>(null);
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
    if (!booking || !date) return;
    let ok = true;
    api<{ slots: Slot[] }>(`/api/availability?date=${date}&duration=${booking.durationMin}`).then(
      (r) => {
        if (ok) setSlotState({ key: `${booking.ref}|${date}|${refresh}`, slots: r.slots });
      },
      () => {},
    );
    return () => {
      ok = false;
    };
  }, [booking, date, refresh]);

  async function confirm() {
    if (!booking || !date || startMin === null) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/bookings/${booking.ref}`, { method: 'PATCH', body: { action: 'reschedule', date, startMin } });
      onDone(`Your booking has been moved to ${formatDateLong(date)} at ${formatTimeRange(startMin, booking.durationMin)}.`);
    } catch (e) {
      setError((e as ApiError).message);
      setRefresh((r) => r + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!booking} onClose={onClose} title="Choose a new date and time">
      {booking && win ? (
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          <DateTimePicker
            window={win}
            durationMin={booking.durationMin}
            date={date}
            startMin={startMin}
            slots={slots}
            loadingSlots={slots === null}
            onDate={(d) => {
              setDate(d);
              setStartMin(null);
            }}
            onTime={(m) => setStartMin(m)}
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
      const endpoint = bookingRef.startsWith('HDH-')
        ? `/api/hostel/bookings/${bookingRef}/checkout`
        : `/api/bookings/${bookingRef}/checkout`;
      const res = await api<{ checkoutUrl: string }>(endpoint, { method: 'POST' });
      if (res.checkoutUrl) window.location.href = res.checkoutUrl;
    } catch (err) {
      setBusy(false);
      alert((err as ApiError).message);
    }
  }
  return (
    <Button variant="primary" size="sm" onClick={onPay} loading={busy} disabled={busy}>
      {busy ? (
        <span>Redirecting to PayPal...</span>
      ) : (
        <>
          <Lock className="size-3.5" aria-hidden /> Pay deposit {depositAmount ? `(${formatMoney(depositAmount)})` : ''}
        </>
      )}
    </Button>
  );
}
