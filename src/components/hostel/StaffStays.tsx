'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bed, Calendar, Lock } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatMoney } from '@/lib/config';
import { formatDateLong } from '@/lib/dates';
import type { HostelBookingView } from '@/lib/types';
import { Alert, Badge, Button, ButtonLink, Card, Modal } from '@/components/ui';

const STATUS: Record<HostelBookingView['status'], { label: string; tone: 'brand' | 'success' | 'neutral' }> = {
  confirmed: { label: 'Confirmed', tone: 'brand' },
  checked_in: { label: 'Checked in', tone: 'success' },
  checked_out: { label: 'Checked out', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

/** Staff accommodation (hostel bunk beds) for the logged-in cleaner. */
export function StaffStays({ justBooked, payment }: { justBooked?: string | null; payment?: string | null }) {
  const [stays, setStays] = useState<HostelBookingView[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<HostelBookingView | null>(null);

  const load = useCallback(
    () =>
      api<{ bookings: HostelBookingView[] }>('/api/hostel/bookings').then(
        (res) => setStays(res.bookings || []),
        (e: ApiError) => setError(e.message),
      ),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = (stays || [])
    .filter((h) => h.status !== 'cancelled' && h.checkOut >= today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const isHostelRef = justBooked?.startsWith('HDH-');

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Bed className="size-6 text-brand-strong" aria-hidden /> Staff accommodation
        </h2>
        <ButtonLink href="/en/hostel/book" size="sm">
          Book a bed
        </ButtonLink>
      </div>

      {isHostelRef && payment === 'cancelled' && (
        <Alert tone="warn" className="mb-4">Your stay {justBooked} is saved, but the deposit has not been paid yet.</Alert>
      )}
      {isHostelRef && payment === 'failed' && (
        <Alert tone="error" className="mb-4">We couldn&apos;t confirm the payment for {justBooked}. Use &quot;Pay deposit&quot; to try again.</Alert>
      )}
      {isHostelRef && !payment && (
        <Alert tone="success" className="mb-4">Your stay is booked. Reference: <strong>{justBooked}</strong>.</Alert>
      )}
      {notice && <Alert tone="success" className="mb-4">{notice}</Alert>}
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {stays && upcoming.length === 0 ? (
        <Card className="p-6 text-muted">No upcoming stays. Need a bed near your jobs? Book one above.</Card>
      ) : (
        <ul className="space-y-4">
          {upcoming.map((h) => (
            <li key={h.ref}>
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold">{h.roomName}</p>
                    <p className="text-brand-strong font-semibold">Bed {h.bedLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {h.paymentStatus === 'paid' && <Badge tone="success">Paid</Badge>}
                    {h.paymentStatus === 'deposit_paid' && <Badge tone="brand">Deposit paid</Badge>}
                    {h.paymentStatus === 'unpaid' && <Badge tone="warn">Deposit unpaid</Badge>}
                    <Badge tone={STATUS[h.status].tone}>{STATUS[h.status].label}</Badge>
                  </div>
                </div>
                <p className="mt-3 flex items-center gap-2">
                  <Calendar className="size-4 text-muted" aria-hidden />
                  {formatDateLong(h.checkIn)} (from 15:00) to {formatDateLong(h.checkOut)} (by 11:00) · {h.nights} night(s)
                </p>
                <p className="mt-1 text-sm text-muted">Ref {h.ref}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xl font-bold">{formatMoney(h.total)}</span>
                  <div className="flex flex-wrap gap-2">
                    {h.paymentStatus === 'unpaid' && <PayDepositButton h={h} />}
                    <Button variant="danger" size="sm" onClick={() => setCancelling(h)}>
                      Cancel stay
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <CancelStayDialog
        key={cancelling?.ref}
        booking={cancelling}
        onClose={() => setCancelling(null)}
        onDone={(msg) => {
          setCancelling(null);
          setNotice(msg);
          load();
        }}
      />
    </section>
  );
}

function PayDepositButton({ h }: { h: HostelBookingView }) {
  const [busy, setBusy] = useState(false);
  async function onPay() {
    setBusy(true);
    try {
      const res = await api<{ checkoutUrl: string }>(`/api/hostel/bookings/${h.ref}/checkout`, { method: 'POST' });
      if (res.checkoutUrl) window.location.href = res.checkoutUrl;
    } catch (err) {
      setBusy(false);
      alert((err as ApiError).message);
    }
  }
  return (
    <Button size="sm" onClick={onPay} loading={busy} disabled={busy}>
      <Lock className="size-3.5" aria-hidden /> Pay deposit ({formatMoney(h.depositAmount)})
    </Button>
  );
}

function CancelStayDialog({
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
      onDone(`Your stay in Bed ${booking.bedLabel} (${booking.roomName}) has been cancelled.`);
    } catch (e) {
      setError((e as ApiError).message);
      setBusy(false);
    }
  }

  return (
    <Modal open={!!booking} onClose={onClose} title="Cancel this stay?">
      {booking && (
        <>
          <p className="text-lg">
            {booking.roomName} · <strong>Bed {booking.bedLabel}</strong>
          </p>
          <p className="mt-1 text-muted">
            {formatDateLong(booking.checkIn)} to {formatDateLong(booking.checkOut)} ({booking.nights} night(s))
          </p>
          {error && <Alert tone="error" className="mt-4">{error}</Alert>}
          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              No, keep it
            </Button>
            <Button variant="danger" onClick={confirm} loading={busy}>
              Yes, cancel stay
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
