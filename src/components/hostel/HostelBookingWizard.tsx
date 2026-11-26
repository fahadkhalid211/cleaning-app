'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Bed,
  Check,
  ChevronRight,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatMoney } from '@/lib/config';
import type { HostelAddon, HostelBed, HostelRoom, MeResponse } from '@/lib/types';
import { BunkBedMap } from './BunkBedMap';
import { Alert, Button, Spinner } from '@/components/ui';
import { useI18n } from '@/lib/i18n';

function formatBedBadge(bedNumber: string): string {
  return bedNumber
    .replace(/-Upper$/i, '-U')
    .replace(/-Lower$/i, '-L')
    .replace(/-top$/i, '-U')
    .replace(/-bottom$/i, '-L');
}

export function HostelBookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, l, locale } = useI18n();
  const hb = t.hostelBook;
  const dt = hb.detailsStep;

  // Selected date parameters (defaults: today -> tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const defaultCheckIn = tomorrow.toISOString().split('T')[0];
  const defaultCheckOut = dayAfter.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || defaultCheckIn);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || defaultCheckOut);

  // Catalog data
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [addonsList, setAddonsList] = useState<HostelAddon[]>([]);
  const [depositPercent, setDepositPercent] = useState<number>(20);
  const [paymentsEnabled, setPaymentsEnabled] = useState<boolean>(false);

  // Selected Room & Bed
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [bedState, setBedState] = useState<{ key: string; beds: HostelBed[] } | null>(null);
  const [selectedBed, setSelectedBed] = useState<HostelBed | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<HostelAddon[]>([]);

  // Auth & Guest Details
  const [me, setMe] = useState<MeResponse['user']>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestGender, setGuestGender] = useState('unspecified');
  const [password, setPassword] = useState('');
  const [eta, setEta] = useState('14:00 - 16:00');
  const [specialRequests, setSpecialRequests] = useState('');

  // UI state
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'bed' | 'details'>('bed');

  const availKey = `${activeRoomId}:${checkIn}:${checkOut}`;
  const beds = bedState?.key === availKey ? bedState.beds : [];
  const loadingBeds = Boolean(activeRoomId && checkIn && checkOut && bedState?.key !== availKey);

  // Load user profile & catalog
  useEffect(() => {
    Promise.all([
      api<MeResponse>('/api/auth/me').catch(() => ({ user: null })),
      api<{ rooms: HostelRoom[]; addons: HostelAddon[]; depositPercent: number; paymentsEnabled: boolean }>('/api/hostel/catalog'),
    ])
      .then(([authRes, catalogRes]) => {
        if (authRes.user) {
          setMe(authRes.user);
          setGuestName(authRes.user.name);
          setGuestEmail(authRes.user.email);
          setGuestPhone(authRes.user.phone);
        }
        setRooms(catalogRes.rooms);
        setAddonsList(catalogRes.addons);
        setDepositPercent(catalogRes.depositPercent || 20);
        setPaymentsEnabled(catalogRes.paymentsEnabled);
        if (catalogRes.rooms.length > 0) {
          const initialRoom = searchParams.get('room') || catalogRes.rooms[0].id;
          setActiveRoomId(initialRoom);
        }
        setLoadingCatalog(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load catalog');
        setLoadingCatalog(false);
      });
  }, [searchParams]);

  // Load bed availability whenever dates or active room change
  useEffect(() => {
    if (!activeRoomId || !checkIn || !checkOut) return;
    let cancelled = false;
    const currentKey = `${activeRoomId}:${checkIn}:${checkOut}`;
    api<{ beds: HostelBed[] }>(
      `/api/hostel/availability?roomId=${encodeURIComponent(activeRoomId)}&checkIn=${encodeURIComponent(
        checkIn,
      )}&checkOut=${encodeURIComponent(checkOut)}`,
    )
      .then((res) => {
        if (cancelled) return;
        setBedState({ key: currentKey, beds: res.beds || [] });
        setSelectedBed((prev) =>
          prev ? ((res.beds || []).find((b) => b.id === prev.id && b.isAvailable) ? prev : null) : null,
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setBedState({ key: currentKey, beds: [] });
        setError(err instanceof ApiError ? err.message : 'Failed to load bed availability.');
      });
    return () => {
      cancelled = true;
    };
  }, [activeRoomId, checkIn, checkOut]);

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.max(1, checkOutDate.getTime() - checkInDate.getTime());
  const nights = Number.isFinite(diffTime) ? Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) : 1;

  const currentRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  // Price calculations
  const bedSubtotal = selectedBed ? selectedBed.pricePerNight * nights : 0;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + (a.perNight ? a.price * nights : a.price), 0);
  const grandTotal = bedSubtotal + addonsTotal;
  const depositAmount = Math.round(grandTotal * (depositPercent / 100) * 100) / 100;

  function toggleAddon(addon: HostelAddon) {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id) ? prev.filter((a) => a.id !== addon.id) : [...prev, addon],
    );
  }

  async function handleBook() {
    if (!selectedBed || !currentRoom) {
      setError(locale === 'cn' ? '请先在平面图上选择一张床位' : 'Please select a bunk bed first.');
      setStep('bed');
      return;
    }

    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setError(locale === 'cn' ? '请填写完整的住客姓名、邮箱与电话。' : 'Please fill in all guest contact details.');
      return;
    }

    if (!me && (!password || password.length < 8)) {
      setError(locale === 'cn' ? '请设置至少8位数的账户密码。' : 'Please choose a password with at least 8 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        account: me
          ? undefined
          : {
              name: guestName.trim(),
              email: guestEmail.trim(),
              phone: guestPhone.trim(),
              password,
            },
        roomId: currentRoom.id,
        bedId: selectedBed.id,
        checkIn,
        checkOut,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
        guestGender,
        eta,
        specialRequests: specialRequests.trim(),
        addons: selectedAddons.map((a) => a.id),
      };

      const res = await api<{
        bookingId: string;
        ref: string;
        checkoutUrl?: string;
        message?: string;
      }>('/api/hostel/bookings', {
        method: 'POST',
        body: payload,
      });

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        router.push(l(`/account?booked=${encodeURIComponent(res.ref)}`));
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Failed to complete booking.';
      setError(message);
      setSubmitting(false);
    }
  }

  if (loadingCatalog) {
    return (
      <div className="py-24 text-center">
        <Spinner label={hb.loadingMap} />
      </div>
    );
  }

  const localizedRoomName = (r: HostelRoom) =>
    t.hostel.rooms.items[r.id]?.name || t.hostel.rooms.items[r.slug]?.name || r.name;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-line shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-strong uppercase tracking-wider">
            <span>{t.common.hostelAndBunks}</span>
            <span>•</span>
            <span>London Central</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mt-1">
            {locale === 'cn' ? '挑选并预订您的床位' : 'Reserve Your Bunk Bed'}
          </h1>
        </div>

        {/* Date Selector Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-soft p-2.5 sm:p-3 rounded-2xl border border-line">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase">{hb.dates.checkIn}</label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (new Date(e.target.value) >= new Date(checkOut)) {
                    const nxt = new Date(e.target.value);
                    nxt.setDate(nxt.getDate() + 1);
                    setCheckOut(nxt.toISOString().split('T')[0]);
                  }
                }}
                className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted uppercase">{hb.dates.checkOut}</label>
              <input
                type="date"
                value={checkOut}
                min={(() => {
                  const d = new Date(checkIn || new Date());
                  d.setDate(d.getDate() + 1);
                  return d.toISOString().split('T')[0];
                })()}
                onChange={(e) => {
                  if (e.target.value) setCheckOut(e.target.value);
                }}
                className="w-full bg-white border border-line rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink"
              />
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2 pt-2 sm:pt-0 sm:pl-3 border-t sm:border-t-0 sm:border-l border-line text-xs font-bold text-brand-strong">
            <span className="sm:hidden text-muted font-normal">{locale === 'cn' ? '入住时长：' : 'Duration:'}</span>
            <span>{hb.dates.nightsCount(nights)}</span>
          </div>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {step === 'bed' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Visual Map Area (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Room Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {rooms.map((room) => {
                const isActive = room.id === activeRoomId;
                const name = localizedRoomName(room);
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setActiveRoomId(room.id)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center gap-2 border ${
                      isActive
                        ? 'bg-ink text-white border-ink shadow-md'
                        : 'bg-white text-muted hover:text-ink border-line hover:border-slate-400'
                    }`}
                  >
                    <Bed className="size-4" />
                    <span>{name}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-soft text-slate-600'
                      }`}
                    >
                      {t.common.from} {formatMoney(room.basePriceNight)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Graphical Bunk Bed Floorplan Selector */}
            {loadingBeds ? (
              <div className="bg-slate-900 rounded-3xl p-16 text-center text-white">
                <Spinner label={locale === 'cn' ? '正在刷新床位空闲状态...' : 'Updating bed availability for your dates…'} />
              </div>
            ) : currentRoom ? (
              <BunkBedMap
                room={currentRoom}
                beds={beds}
                selectedBedId={selectedBed?.id || null}
                onSelectBed={(bed) => setSelectedBed(bed)}
                nights={nights}
              />
            ) : null}
          </div>

          {/* Right Column: Live Selection Card & Pricing Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-line shadow-card space-y-6 sticky top-24">
              <div>
                <h3 className="text-lg font-bold text-ink">{dt.bookingSummaryTitle}</h3>
                <p className="text-xs text-muted">{locale === 'cn' ? '实时核对您的选床与行程' : 'Review your selection'}</p>
              </div>

              {selectedBed && currentRoom ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 bg-soft rounded-2xl space-y-2 border border-line">
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted">{dt.roomLabel}</span>
                      <span className="text-ink text-right">{localizedRoomName(currentRoom)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted">{dt.bedLabel}</span>
                      <span className="text-brand-strong font-bold">
                        {locale === 'cn' ? '床位 ' : 'Bed '}
                        {formatBedBadge(selectedBed.bedNumber)} (
                        {selectedBed.tier === 'top' ? hb.podCard.upper : hb.podCard.lower})
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted">{dt.nightsLabel}</span>
                      <span>{hb.dates.nightsCount(nights)}</span>
                    </div>
                  </div>

                  {/* Add-ons picker */}
                  <div className="space-y-2 pt-2 border-t border-line">
                    <p className="font-bold text-ink text-xs uppercase tracking-wider">{dt.extrasTitle}</p>
                    <div className="space-y-2">
                      {addonsList.map((addon) => {
                        const isChecked = selectedAddons.some((a) => a.id === addon.id);

                        const addonTrans = hb.addons?.[addon.id];
                        const localizedAddon = addonTrans
                          ? { name: addonTrans.name, description: addonTrans.description }
                          : addon;

                        return (
                          <label
                            key={addon.id}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                              isChecked ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-line hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleAddon(addon)}
                              className="mt-0.5 rounded text-brand focus:ring-brand"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between font-semibold text-ink">
                                <span>{localizedAddon.name}</span>
                                <span>+{formatMoney(addon.perNight ? addon.price * nights : addon.price)}</span>
                              </div>
                              <p className="text-[11px] text-muted leading-tight mt-0.5">
                                {localizedAddon.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total calculation */}
                  <div className="space-y-2 pt-3 border-t border-line text-sm">
                    <div className="flex justify-between text-muted text-xs">
                      <span>{dt.basePriceLabel} ({hb.dates.nightsCount(nights)})</span>
                      <span>{formatMoney(bedSubtotal)}</span>
                    </div>
                    {addonsTotal > 0 && (
                      <div className="flex justify-between text-muted text-xs">
                        <span>{dt.extrasLabel}</span>
                        <span>{formatMoney(addonsTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-extrabold text-ink pt-2 border-t border-dashed border-line">
                      <span>{dt.totalCostLabel}</span>
                      <span>{formatMoney(grandTotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-brand-strong font-semibold bg-brand/10 p-2.5 rounded-xl">
                      <span>{dt.depositDueTodayLabel}</span>
                      <span>{formatMoney(depositAmount)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep('details')}
                    className="w-full justify-center shadow-pop text-sm font-bold py-3.5"
                  >
                    {hb.summaryBar.continueBtn} <ChevronRight className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center text-muted text-xs space-y-2">
                  <Bed className="size-8 mx-auto text-slate-300" />
                  <p className="font-semibold text-ink">
                    {locale === 'cn' ? '暂未选定床位' : 'No bed selected'}
                  </p>
                  <p>{hb.summaryBar.selectedBedPrompt}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Guest Details, Auth & Payment */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-line shadow-card space-y-8">
          <div>
            <button
              type="button"
              onClick={() => setStep('bed')}
              className="text-xs font-semibold text-brand hover:underline mb-2 flex items-center gap-1"
            >
              ← {dt.backToBedSelection}
            </button>
            <h2 className="text-2xl font-bold text-ink">{dt.heading}</h2>
            <p className="text-xs text-muted">{dt.sub}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">{dt.fullNameLabel} *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder={dt.fullNamePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">{dt.emailLabel} *</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder={dt.emailPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">{dt.phoneLabel} *</label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder={dt.phonePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">{dt.genderLabel} *</label>
                <select
                  value={guestGender}
                  onChange={(e) => setGuestGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none bg-white"
                >
                  <option value="unspecified">{dt.genderUnspecified}</option>
                  <option value="female">{dt.genderFemale}</option>
                  <option value="male">{dt.genderMale}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">{dt.arrivalTimeLabel}</label>
              <select
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none bg-white"
              >
                <option value="14:00 - 16:00">
                  {locale === 'cn' ? '14:00 – 16:00（标准办理入住时段）' : '14:00 – 16:00 (Standard check-in)'}
                </option>
                <option value="16:00 - 18:00">16:00 – 18:00</option>
                <option value="18:00 - 20:00">
                  {locale === 'cn' ? '18:00 – 20:00（傍晚时段）' : '18:00 – 20:00 (Evening)'}
                </option>
                <option value="20:00 - 23:00">
                  {locale === 'cn' ? '20:00 – 23:00（夜间晚到）' : '20:00 – 23:00 (Late arrival)'}
                </option>
                <option value="After 23:00">
                  {locale === 'cn' ? '23:00 之后（深夜自助电子门禁入室）' : 'After 23:00 (Self keycard entry)'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">{dt.specialRequestsLabel}</label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder={dt.specialRequestsPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              />
            </div>

            {/* Seamless Account Creation for Guests */}
            {!me && (
              <div className="p-4 bg-cream/70 rounded-2xl border border-amber-200/60 space-y-2">
                <p className="font-bold text-xs text-ink">{dt.createPasswordLabel}</p>
                <p className="text-[11px] text-muted">
                  {locale === 'cn'
                    ? '您可使用此密码登录个人账户中心，随时查看青旅订单、门禁密码及支付收据。'
                    : 'You will use this password to view your hostel reservation, door access codes, and payment receipt in your dashboard.'}
                </p>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={dt.createPasswordPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                />
                <p className="text-[11px] text-muted pt-1">
                  {locale === 'cn' ? '已有账户？' : 'Already have an account?'}{' '}
                  <Link
                    href={l(`/login?next=${encodeURIComponent(l('/hostel/book'))}`)}
                    className="font-semibold text-brand underline"
                  >
                    {locale === 'cn' ? '点击在此登录' : 'Log in here'}
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Final Payment & Submission */}
          <div className="pt-6 border-t border-line space-y-4">
            <div className="flex items-center justify-between text-base font-bold text-ink">
              <span>{dt.totalCostLabel} ({hb.dates.nightsCount(nights)})</span>
              <span>{formatMoney(grandTotal)}</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
              <div>
                <p className="font-bold">{dt.depositDueTodayLabel}</p>
                <p className="text-emerald-700">{dt.balanceAtCheckinLabel}</p>
              </div>
              <p className="text-xl font-extrabold text-emerald-900">{formatMoney(depositAmount)}</p>
            </div>

            <Button
              onClick={handleBook}
              disabled={submitting}
              loading={submitting}
              className="w-full justify-center shadow-pop text-base font-bold py-3.5 text-white"
            >
              {submitting ? (
                <span>{dt.processingPayment}</span>
              ) : paymentsEnabled ? (
                <>
                  <CreditCard className="size-5" /> {dt.payWithPaypalBtn} ({formatMoney(depositAmount)})
                </>
              ) : (
                <>
                  <Check className="size-5" /> {dt.confirmAndPayBtn}
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-muted flex items-center justify-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600" />
              {locale === 'cn'
                ? '入住前24小时以上支持免费取消并退还定金。'
                : 'Free cancellation up to 24 hours prior to check-in.'}
            </p>
          </div>
        </div>
      )}

      {/* Mobile Sticky Selection Bar */}
      {selectedBed && currentRoom && step === 'bed' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-line p-3.5 shadow-pop flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 truncate">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
              <span className="text-brand-strong">
                {locale === 'cn' ? '床位 ' : 'Bed '}
                {formatBedBadge(selectedBed.bedNumber)}
              </span>
              <span>·</span>
              <span className="text-emerald-700">{formatMoney(grandTotal)}</span>
            </div>
            <p className="text-[11px] text-muted truncate">
              {localizedRoomName(currentRoom)} · {hb.dates.nightsCount(nights)}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setStep('details');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="shrink-0 font-bold"
          >
            {locale === 'cn' ? '继续填写' : 'Continue'} <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
