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
import { useI18n } from '@/lib/i18n';

export function CustomerAccount() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, l, locale } = useI18n();
  const acc = t.account;

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
          if (e.status === 401 || e.status === 403) router.replace(l(`/login?next=${encodeURIComponent(l('/account'))}`));
          else setError(e.message);
        },
      ),
    [router, justBooked, l],
  );

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.replace(l('/'));
    router.refresh();
  }

  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Alert tone="error">{error}</Alert>
      </div>
    );
  if (!bookings || !hostelBookings || !me) return <Spinner label={locale === 'cn' ? '正在载入您的订单...' : 'Loading your bookings…'} />;

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
          <p className="text-muted text-lg">
            {locale === 'cn' ? `您好，${me.name}` : `Hello, ${me.name.split(' ')[0]}`}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink mt-1">
            {locale === 'cn' ? '您的订单与行程' : 'Your bookings & stays'}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={l('/hostel/book')} className="bg-brand text-white">
            <Bed className="size-4" aria-hidden /> {acc.bookBunkBtn}
          </ButtonLink>
          <ButtonLink href={l('/book')} variant="secondary">
            <Plus className="size-4" aria-hidden /> {acc.bookCleanBtn}
          </ButtonLink>
          <Button variant="secondary" onClick={logout}>
            <LogOut className="size-4" aria-hidden /> {acc.signOut}
          </Button>
        </div>
      </div>

      {/* Payment / Confirmation Alerts */}
      {payment === 'cancelled' && (
        <Alert tone="error" title={locale === 'cn' ? '支付未完成' : 'Payment not completed'} className="mt-8">
          {locale === 'cn'
            ? '您的预订信息已保存，但定金尚未支付完成。您可点击下方的“支付定金”按钮通过 PayPal 完成付款。'
            : 'Your reservation is saved but the deposit hasn’t been paid yet. Use "Pay deposit" below to complete it with PayPal.'}
        </Alert>
      )}
      {payment === 'failed' && (
        <Alert tone="error" title={locale === 'cn' ? '无法确认您的付款' : "We couldn't confirm your payment"} className="mt-8">
          {locale === 'cn'
            ? '如果 PayPal 已经扣款，系统将在数分钟内自动同步更新。若未扣款，请点击下方按钮重新尝试。'
            : 'If PayPal charged you, it will be matched to your booking automatically within a few minutes. Otherwise, use "Pay deposit" below to try again.'}
        </Alert>
      )}
      {paid && (
        <Alert tone="success" title={locale === 'cn' ? '定金支付成功！' : 'Payment successful! Your deposit has been received.'} className="mt-8">
          {locale === 'cn'
            ? '您的预订已正式确认并锁定。确认函已发送至您的电子邮箱，我们期待您的光临！'
            : 'Your reservation is confirmed and secured with PayPal. We look forward to hosting you!'}
        </Alert>
      )}
      {confirmedClean && !paid && !payment && (
        <Alert tone="success" title={locale === 'cn' ? '您的保洁预约已确认，感谢您的选择！' : 'Your cleaning booking is confirmed. Thank you!'} className="mt-8">
          {locale === 'cn' ? (
            <>
              订单编号：<strong>{confirmedClean.ref}</strong>。保洁师将于 {formatDateLong(confirmedClean.date)}{' '}
              {formatTimeRange(confirmedClean.startMin, confirmedClean.durationMin).split(' – ')[0]} 准时上门。
            </>
          ) : (
            <>
              Your reference is <strong>{confirmedClean.ref}</strong>. We will see you on {formatDateLong(confirmedClean.date)} at{' '}
              {formatTimeRange(confirmedClean.startMin, confirmedClean.durationMin).split(' – ')[0]}.
            </>
          )}
        </Alert>
      )}
      {confirmedHostel && !paid && !payment && (
        <Alert tone="success" title={locale === 'cn' ? '您的青年旅舍住宿已确认，感谢您的预订！' : 'Your hostel stay is confirmed. Thank you!'} className="mt-8">
          {locale === 'cn' ? (
            <>
              订单编号：<strong>{confirmedHostel.ref}</strong>。宿舍：<strong>{confirmedHostel.roomName}</strong>，床位：{' '}
              <strong>{confirmedHostel.bedLabel}</strong>。入住日期：{formatDateLong(confirmedHostel.checkIn)}（下午15:00起办理）。
            </>
          ) : (
            <>
              Your reference is <strong>{confirmedHostel.ref}</strong>. Room: <strong>{confirmedHostel.roomName}</strong>, Bed:{' '}
              <strong>{confirmedHostel.bedLabel}</strong>. Check-in: {formatDateLong(confirmedHostel.checkIn)} (15:00 onwards).
            </>
          )}
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
          {acc.tabs.all} ({totalUpcoming})
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
          <span>{acc.tabs.hostel} ({upcomingHostel.length})</span>
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
          <span>{acc.tabs.cleaning} ({upcomingCleans.length})</span>
        </button>
      </div>

      {/* UPCOMING SECTION */}
      <section className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold text-ink">
          {locale === 'cn' ? '近期行程与预约' : 'Upcoming reservations'}
        </h2>

        {/* When active tab includes Hostel */}
        {(activeTab === 'all' || activeTab === 'hostel') && upcomingHostel.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2">
              <Bed className="size-5 text-brand-strong" />
              <span>{acc.tabs.hostel}</span>
            </h3>
            <ul className="space-y-4">
              {upcomingHostel.map((h) => (
                <li key={h.ref}>
                  <HostelBookingCard h={h} onCancel={() => setCancellingHostel(h)} locale={locale} />
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
              <span>{acc.tabs.cleaning}</span>
            </h3>
            <ul className="space-y-4">
              {upcomingCleans.map((b) => (
                <li key={b.ref}>
                  <BookingCard b={b} onCancel={() => setCancelling(b)} onMove={() => setMoving(b)} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'all' && totalUpcoming === 0 && (
          <Card className="p-10 text-center space-y-4">
            <p className="text-lg text-muted">{acc.noBookings}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href={l('/hostel/book')}>
                <Bed className="size-4" /> {acc.bookBunkBtn}
              </ButtonLink>
              <ButtonLink href={l('/book')} variant="secondary">
                <Plus className="size-4" /> {acc.bookCleanBtn}
              </ButtonLink>
            </div>
          </Card>
        )}

        {activeTab === 'hostel' && upcomingHostel.length === 0 && (
          <Card className="p-10 text-center space-y-4">
            <p className="text-lg text-muted">
              {locale === 'cn' ? '暂无青旅住宿订单。' : 'You have no upcoming hostel stays.'}
            </p>
            <div>
              <ButtonLink href={l('/hostel/book')}>
                <Bed className="size-4" /> {acc.bookBunkBtn}
              </ButtonLink>
            </div>
          </Card>
        )}

        {activeTab === 'cleaning' && upcomingCleans.length === 0 && (
          <Card className="p-10 text-center space-y-4">
            <p className="text-lg text-muted">
              {locale === 'cn' ? '暂无保洁预约记录。' : 'You have no upcoming home cleans.'}
            </p>
            <div>
              <ButtonLink href={l('/book')}>
                <Plus className="size-4" /> {acc.bookCleanBtn}
              </ButtonLink>
            </div>
          </Card>
        )}
      </section>

      {/* PAST & CANCELLED SECTION */}
      {(pastCleans.length > 0 || pastHostel.length > 0) && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-ink mb-4">
            {locale === 'cn' ? '历史与已取消订单' : 'Past and cancelled'}
          </h2>
          <Card className="divide-y divide-line">
            {pastHostel.map((h) => (
              <div key={h.ref} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-brand-light text-brand-strong shrink-0">
                    <Bed className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">
                        {t.hostel.rooms.items[h.roomId]?.name || h.roomName}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {locale === 'cn' ? '床位 ' : 'Bed '}
                        {h.bedLabel}
                      </span>
                    </div>
                    <p className="text-sm text-muted mt-0.5">
                      {formatDateLong(h.checkIn, locale)} – {formatDateLong(h.checkOut, locale)} ({h.nights} {locale === 'cn' ? '晚' : 'nights'}) · Ref {h.ref}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center justify-between sm:flex-col sm:items-end gap-2">
                  <HostelStatusBadge status={h.status} locale={locale} />
                  <p className="font-bold text-ink">{formatMoney(h.total)}</p>
                </div>
              </div>
            ))}

            {pastCleans.map((b) => (
              <div key={b.ref} className="flex items-center gap-4 p-5">
                <DateBlock date={b.date} muted locale={locale} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">
                    {t.servicesCatalog[b.serviceId]?.title || b.serviceTitle}
                  </p>
                  <p className="text-sm text-muted">
                    {b.street} · Ref {b.ref}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <StatusBadge status={b.status} locale={locale} />
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
          <Phone className="size-5" aria-hidden />
          {locale === 'cn' ? '24小时前台热线：' : '24/7 Front Desk: '}
          {BRAND.phone}
        </a>
      </Card>

      {/* Cancellation Dialogs */}
      <CancelDialog
        key={`c-${cancelling?.ref}`}
        booking={cancelling}
        locale={locale}
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
        locale={locale}
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
        locale={locale}
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

function HostelBookingCard({
  h,
  onCancel,
  locale,
}: {
  h: HostelBookingView;
  onCancel: () => void;
  locale?: string;
}) {
  const { t } = useI18n();
  const roomTypeLabel =
    locale === 'cn'
      ? {
          mixed: '男女混住间',
          female: '女生专属间',
          male: '男生专属间',
          deluxe: '豪华太空舱',
        }[h.roomType] || h.roomType
      : {
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
                <h3 className="text-xl font-bold text-ink">
                  {t.hostel.rooms.items[h.roomId]?.name || h.roomName}
                </h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                  {roomTypeLabel}
                </span>
              </div>
              <p className="text-sm text-brand-strong font-bold mt-0.5">
                {locale === 'cn' ? '床位 ' : 'Bed '}
                {h.bedLabel} · {h.tier === 'top' ? (locale === 'cn' ? '上铺' : 'Upper Bunk') : (locale === 'cn' ? '下铺' : 'Lower Bunk / Pod')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {h.paymentStatus === 'paid' && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  ✓ {locale === 'cn' ? '已全额付清' : 'Fully Paid'}
                </span>
              )}
              {h.paymentStatus === 'deposit_paid' && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                  {locale === 'cn' ? `定金已付 (${formatMoney(h.depositAmount)})` : `Deposit Paid (${formatMoney(h.depositAmount)})`}
                </span>
              )}
              {h.paymentStatus === 'unpaid' && h.status !== 'cancelled' && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  {locale === 'cn' ? '定金待支付' : 'Deposit Unpaid'}
                </span>
              )}
              <HostelStatusBadge status={h.status} locale={locale} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-sm">
            <div className="space-y-1.5">
              <p className="flex items-center gap-2 text-slate-700">
                <Calendar className="size-4 text-muted shrink-0" />
                <span>
                  <strong>{locale === 'cn' ? '入住时间：' : 'Check-in:'}</strong> {formatDateLong(h.checkIn, locale)}{' '}
                  {locale === 'cn' ? '（15:00 起）' : '(from 15:00)'}
                </span>
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <CalendarClock className="size-4 text-muted shrink-0" />
                <span>
                  <strong>{locale === 'cn' ? '退房时间：' : 'Check-out:'}</strong> {formatDateLong(h.checkOut, locale)}{' '}
                  {locale === 'cn' ? '（11:00 前）' : '(by 11:00)'}
                </span>
              </p>
              <p className="text-xs text-muted pl-6">
                {locale === 'cn' ? `入住天数：共 ${h.nights} 晚` : `Duration: ${h.nights} night(s)`}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="flex items-center gap-2 text-slate-700">
                <User className="size-4 text-muted shrink-0" />
                <span>
                  {locale === 'cn' ? '住客：' : 'Guest: '}
                  <strong>{h.guestName}</strong> ({h.guestPhone})
                </span>
              </p>
              {h.addons && h.addons.length > 0 && (
                <p className="text-xs text-slate-600 pl-6">
                  {locale === 'cn' ? '增值服务：' : 'Add-ons: '}
                  {h.addons.map((a) => t.hostelBook.addons[a.id]?.name || a.name).join(', ')}
                </p>
              )}
              <p className="text-xs text-muted pl-6">
                {locale === 'cn' ? '预订参考号：' : 'Booking Ref: '}
                <strong>{h.ref}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line">
            <div>
              <span className="text-2xl font-black text-ink">{formatMoney(h.total)}</span>
              {h.paymentStatus === 'deposit_paid' && (
                <span className="text-xs text-muted block">
                  {locale === 'cn'
                    ? `剩余余款 ${formatMoney(h.total - h.depositAmount)} 到店办理入住时结算`
                    : `Remaining balance of ${formatMoney(h.total - h.depositAmount)} due at check-in`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {h.paymentStatus === 'unpaid' && h.status !== 'cancelled' && (
                <PayDepositButton bookingRef={h.ref} depositAmount={h.depositAmount} locale={locale} />
              )}
              {h.status !== 'cancelled' && (
                <Button variant="danger" size="sm" onClick={onCancel}>
                  {locale === 'cn' ? '取消住宿' : 'Cancel Stay'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function HostelStatusBadge({
  status,
  locale,
}: {
  status: HostelBookingView['status'];
  locale?: string;
}) {
  if (status === 'confirmed') {
    return <Badge tone="brand">{locale === 'cn' ? '已确认' : 'Confirmed'}</Badge>;
  }
  if (status === 'checked_in') {
    return <Badge tone="success">{locale === 'cn' ? '已入住' : 'Checked In'}</Badge>;
  }
  if (status === 'checked_out') {
    return <Badge tone="neutral">{locale === 'cn' ? '已退房' : 'Checked Out'}</Badge>;
  }
  return <Badge tone="neutral">{locale === 'cn' ? '已取消' : 'Cancelled'}</Badge>;
}

// ---------------------------------------------------------------------------
// Cleaning Booking Card
// ---------------------------------------------------------------------------

function BookingCard({
  b,
  onCancel,
  onMove,
  locale,
}: {
  b: BookingView;
  onCancel: () => void;
  onMove: () => void;
  locale?: string;
}) {
  const { t } = useI18n();
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex gap-4 sm:gap-5">
        <DateBlock date={b.date} locale={locale} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <h3 className="text-xl font-semibold">
              {t.servicesCatalog[b.serviceId]?.title || b.serviceTitle}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {b.paymentStatus === 'paid' && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  {locale === 'cn' ? '已付清' : 'Fully Paid'}
                </span>
              )}
              {b.paymentStatus === 'deposit_paid' && (
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                  {locale === 'cn' ? `定金已付 (${formatMoney(b.depositAmount || 0)})` : `Deposit Paid (${formatMoney(b.depositAmount || 0)})`}
                </span>
              )}
              {(!b.paymentStatus || b.paymentStatus === 'unpaid') && b.status !== 'cancelled' && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                  {locale === 'cn' ? '定金待付' : 'Deposit Unpaid'}
                </span>
              )}
              <StatusBadge status={b.status} locale={locale} />
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
                <User className="size-5 text-muted shrink-0" aria-hidden />
                {locale === 'cn' ? '指派保洁师：' : 'Your cleaner: '}
                {b.cleaner.name}
              </li>
            )}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p>
              <span className="text-2xl font-semibold">{formatMoney(b.total)}</span>
              <span className="text-muted">
                {' '}
                · {t.booking.frequencies[b.frequency as keyof typeof t.booking.frequencies] || FREQUENCIES.find((f) => f.id === b.frequency)?.label} · Ref {b.ref}
              </span>
            </p>
            {b.canChange ? (
              <div className="flex flex-wrap gap-2">
                {(!b.paymentStatus || b.paymentStatus === 'unpaid') && b.status !== 'cancelled' && (
                  <PayDepositButton bookingRef={b.ref} depositAmount={b.depositAmount} locale={locale} />
                )}
                <Button variant="secondary" size="sm" onClick={onMove}>
                  <CalendarClock className="size-4" aria-hidden /> {locale === 'cn' ? '更改日期或时段' : 'Change date or time'}
                </Button>
                <Button variant="danger" size="sm" onClick={onCancel}>
                  {locale === 'cn' ? '取消预约' : 'Cancel booking'}
                </Button>
              </div>
            ) : (
              b.status === 'confirmed' && (
                <p className="text-muted text-[0.95rem]">
                  {locale === 'cn'
                    ? `距离服务不足 ${SCHEDULE.changeCutoffHours} 小时。如需更改请致电客服。`
                    : `Less than ${SCHEDULE.changeCutoffHours}h to go. Call us to make changes.`}
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
  locale,
  onClose,
  onDone,
}: {
  booking: HostelBookingView | null;
  locale?: string;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (!booking) return;
    setBusy(true);
    try {
      await api(`/api/hostel/bookings/${booking.ref}`, { method: 'PATCH', body: { action: 'cancel' } });
      onDone(
        locale === 'cn'
          ? `您在 ${booking.roomName} 的床位 ${booking.bedLabel} 预订已成功取消。`
          : `Your stay for Bed ${booking.bedLabel} (${booking.roomName}) has been cancelled.`,
      );
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!booking} onClose={onClose} title={locale === 'cn' ? '确认取消该青旅预订？' : 'Cancel this hostel stay?'}>
      {booking && (
        <>
          <p className="text-lg">
            {t.hostel.rooms.items[booking.roomId]?.name || booking.roomName} ·{' '}
            <strong>
              {locale === 'cn' ? '床位 ' : 'Bed '}
              {booking.bedLabel}
            </strong>
          </p>
          <p className="mt-1 text-muted">
            {locale === 'cn'
              ? `${formatDateLong(booking.checkIn)} 至 ${formatDateLong(booking.checkOut)}（共 ${booking.nights} 晚）`
              : `${formatDateLong(booking.checkIn)} to ${formatDateLong(booking.checkOut)} (${booking.nights} night(s)).`}
          </p>
          <p className="mt-3 text-sm text-muted">
            {locale === 'cn'
              ? '到达日前24小时以上支持免费取消。若您已通过 PayPal 支付定金，系统将按规则处理，如有疑问请随时联系前台。'
              : 'Free cancellation before your scheduled arrival date. If a deposit was already paid via PayPal, please contact reception if you require assistance.'}
          </p>
          {error && <Alert tone="error" className="mt-4">{error}</Alert>}
          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              {locale === 'cn' ? '保留预订' : 'No, keep it'}
            </Button>
            <Button variant="primary" className="!bg-danger hover:!bg-danger/90" onClick={confirm} loading={busy}>
              {locale === 'cn' ? '确认取消' : 'Yes, cancel stay'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function CancelDialog({
  booking,
  locale,
  onClose,
  onDone,
}: {
  booking: BookingView | null;
  locale?: string;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (!booking) return;
    setBusy(true);
    try {
      await api(`/api/bookings/${booking.ref}`, { method: 'PATCH', body: { action: 'cancel' } });
      onDone(
        locale === 'cn'
          ? `您在 ${formatDateLong(booking.date)} 的保洁预约已成功取消，未产生任何费用。`
          : `Your booking on ${formatDateLong(booking.date)} has been cancelled. You have not been charged.`,
      );
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!booking} onClose={onClose} title={locale === 'cn' ? '确认取消本次保洁？' : 'Cancel this booking?'}>
      {booking && (
        <>
          <p className="text-lg">
            {t.servicesCatalog[booking.serviceId]?.title || booking.serviceTitle}{' '}
            {locale === 'cn' ? '在' : 'on'} <strong>{formatDateLong(booking.date)}</strong>{' '}
            {locale === 'cn' ? '于' : 'at'} {formatTimeRange(booking.startMin, booking.durationMin)}.
          </p>
          <p className="mt-2 text-muted">
            {locale === 'cn' ? '服务开始前24小时以上取消不收取任何费用。' : 'There is no charge for cancelling.'}
          </p>
          {error && <Alert tone="error" className="mt-4">{error}</Alert>}
          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              {locale === 'cn' ? '保留预约' : 'No, keep it'}
            </Button>
            <Button variant="primary" className="!bg-danger hover:!bg-danger/90" onClick={confirm} loading={busy}>
              {locale === 'cn' ? '确认取消' : 'Yes, cancel booking'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function MoveDialog({
  booking,
  locale,
  onClose,
  onDone,
}: {
  booking: BookingView | null;
  locale?: string;
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
    api<{ slots: Slot[] }>('/api/availability', {
      method: 'POST',
      body: { date, ref: booking.ref },
    }).then(
      (r) => {
        if (ok) setSlotState({ key: `${booking.ref}|${date}|${refresh}`, slots: r.slots });
      },
      (err: unknown) => {
        if (ok) {
          setError(err instanceof ApiError ? err.message : 'Failed to load available times.');
          setSlotState({ key: `${booking.ref}|${date}|${refresh}`, slots: [] });
        }
      },
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
      onDone(
        locale === 'cn'
          ? `您的预约已成功调整至 ${formatDateLong(date)} ${formatTimeRange(startMin, booking.durationMin)}。`
          : `Your booking has been moved to ${formatDateLong(date)} at ${formatTimeRange(startMin, booking.durationMin)}.`,
      );
    } catch (e) {
      setError((e as ApiError).message);
      setRefresh((r) => r + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!booking} onClose={onClose} title={locale === 'cn' ? '选择新的上门日期与时间' : 'Choose a new date and time'}>
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
              {locale === 'cn' ? '维持原时间' : 'Keep current time'}
            </Button>
            <Button onClick={confirm} loading={busy} disabled={!date || startMin === null}>
              {locale === 'cn' ? '确认更改时间' : 'Move my booking'}
            </Button>
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </Modal>
  );
}

function PayDepositButton({
  bookingRef,
  depositAmount,
  locale,
}: {
  bookingRef: string;
  depositAmount?: number;
  locale?: string;
}) {
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
        <span>{locale === 'cn' ? '正在连接 PayPal...' : 'Redirecting to PayPal...'}</span>
      ) : (
        <>
          <Lock className="size-3.5" aria-hidden />
          {locale === 'cn' ? '支付定金' : 'Pay deposit'} {depositAmount ? `(${formatMoney(depositAmount)})` : ''}
        </>
      )}
    </Button>
  );
}
