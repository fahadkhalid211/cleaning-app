'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  Bed,
  Calendar,
  Check,
  ChevronRight,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { BRAND, formatMoney } from '@/lib/config';
import type { HostelAddon, HostelBed, HostelRoom, MeResponse } from '@/lib/types';
import { BunkBedMap } from './BunkBedMap';
import { Alert, Button, Card, Spinner } from '@/components/ui';

export function HostelBookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [beds, setBeds] = useState<HostelBed[]>([]);
  const [selectedBed, setSelectedBed] = useState<HostelBed | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<HostelAddon[]>([]);

  // Auth & Guest Details
  const [me, setMe] = useState<MeResponse['user']>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestGender, setGuestGender] = useState('unspecified');
  const [password, setPassword] = useState('');
  const [eta, setEta] = useState('14:00 - 18:00');
  const [specialRequests, setSpecialRequests] = useState('');

  // UI state
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'bed' | 'details'>('bed');

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
      .catch((err) => {
        setError(err.message);
        setLoadingCatalog(false);
      });
  }, [searchParams]);

  // Load beds whenever activeRoomId, checkIn, or checkOut changes
  const loadBeds = useCallback(() => {
    if (!activeRoomId) return;
    setLoadingBeds(true);
    setError(null);
    api<{ beds: HostelBed[]; totalBeds: number; availableBeds: number }>(
      `/api/hostel/availability?roomId=${encodeURIComponent(activeRoomId)}&checkIn=${encodeURIComponent(
        checkIn,
      )}&checkOut=${encodeURIComponent(checkOut)}`,
    )
      .then((res) => {
        setBeds(res.beds);
        // If current selected bed is in this room and not available, deselect it
        setSelectedBed((prev) => {
          if (!prev) return null;
          const stillThere = res.beds.find((b) => b.id === prev.id);
          return stillThere && stillThere.isAvailable ? prev : null;
        });
        setLoadingBeds(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingBeds(false);
      });
  }, [activeRoomId, checkIn, checkOut]);

  useEffect(() => {
    loadBeds();
  }, [loadBeds]);

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

  // Financial calculations
  const bedRate = selectedBed?.pricePerNight || 0;
  const bedSubtotal = Math.round(bedRate * nights * 100) / 100;
  const addonsTotal = selectedAddons.reduce((sum, a) => {
    const cost = a.perNight ? a.price * nights : a.price;
    return sum + cost;
  }, 0);
  const grandTotal = Math.round((bedSubtotal + addonsTotal) * 100) / 100;
  const depositAmount = Math.round(grandTotal * (depositPercent / 100) * 100) / 100;

  const currentRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  function toggleAddon(addon: HostelAddon) {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  }

  async function handleBook() {
    if (!selectedBed || !currentRoom) return;
    setError(null);
    setSubmitting(true);

    try {
      const payload: Record<string, any> = {
        roomId: currentRoom.id,
        bedId: selectedBed.id,
        checkIn,
        checkOut,
        guestName,
        guestEmail,
        guestPhone,
        guestGender,
        eta,
        specialRequests,
        addons: selectedAddons.map((a) => ({
          id: a.id,
          name: a.name,
          price: a.perNight ? a.price * nights : a.price,
        })),
      };

      if (!me) {
        if (!password || password.length < 8) {
          throw new Error('Please create a password with at least 8 characters for your account.');
        }
        payload.account = {
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          password,
        };
      }

      const res = await api<{
        ref: string;
        checkoutUrl: string | null;
        depositAmount: number;
        paymentsEnabled: boolean;
      }>('/api/hostel/bookings', {
        method: 'POST',
        body: payload,
      });

      if (res.checkoutUrl) {
        // Redirect to PayPal checkout
        window.location.href = res.checkoutUrl;
      } else {
        // Direct booking confirmation
        router.push(`/account?booked=${encodeURIComponent(res.ref)}`);
      }
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : err.message || 'Failed to complete booking.');
      setSubmitting(false);
    }
  }

  if (loadingCatalog) {
    return (
      <div className="py-24 text-center">
        <Spinner label="Loading hostel dorms & beds…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-line shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-strong uppercase tracking-wider">
            <span>Hostel Bunk Bed Booking</span>
            <span>•</span>
            <span>London Central</span>
          </div>
          <h1 className="text-3xl font-extrabold text-ink mt-1">Reserve Your Bunk Bed</h1>
        </div>

        {/* Date Selector Strip */}
        <div className="flex flex-wrap items-center gap-3 bg-soft p-2.5 rounded-2xl border border-line">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase">Check-in</label>
            <input
              type="date"
              value={checkIn}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setCheckIn(e.target.value);
                // Ensure checkOut is at least 1 day after checkIn
                if (new Date(e.target.value) >= new Date(checkOut)) {
                  const nxt = new Date(e.target.value);
                  nxt.setDate(nxt.getDate() + 1);
                  setCheckOut(nxt.toISOString().split('T')[0]);
                }
              }}
              className="bg-white border border-line rounded-lg px-2.5 py-1 text-xs font-semibold text-ink"
            />
          </div>

          <div className="text-muted font-bold text-sm">→</div>

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase">Check-out</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-white border border-line rounded-lg px-2.5 py-1 text-xs font-semibold text-ink"
            />
          </div>

          <div className="pl-2 border-l border-line text-xs font-bold text-brand-strong">
            {nights} {nights === 1 ? 'Night' : 'Nights'}
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
                    <span>{room.name}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-soft text-slate-600'
                      }`}
                    >
                      From {formatMoney(room.basePriceNight)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Graphical Bunk Bed Floorplan Selector */}
            {loadingBeds ? (
              <div className="bg-slate-900 rounded-3xl p-16 text-center text-white">
                <Spinner label="Updating bed availability for your dates…" />
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
                <h3 className="text-lg font-bold text-ink">Booking Summary</h3>
                <p className="text-xs text-muted">Review your selection</p>
              </div>

              {selectedBed && currentRoom ? (
                <div className="space-y-4 text-xs">
                  <div className="p-3.5 bg-soft rounded-2xl space-y-2 border border-line">
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted">Dorm Room</span>
                      <span className="text-ink text-right">{currentRoom.name}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted">Bed Choice</span>
                      <span className="text-brand-strong font-black">
                        Bed {selectedBed.bedNumber} ({selectedBed.tier === 'top' ? 'Upper' : 'Lower'})
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-muted">Stay</span>
                      <span>{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                    </div>
                  </div>

                  {/* Add-ons picker */}
                  <div className="space-y-2 pt-2 border-t border-line">
                    <p className="font-bold text-ink text-xs uppercase tracking-wider">Hostel Add-ons</p>
                    <div className="space-y-2">
                      {addonsList.map((addon) => {
                        const isChecked = selectedAddons.some((a) => a.id === addon.id);
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
                                <span>{addon.name}</span>
                                <span>+{formatMoney(addon.perNight ? addon.price * nights : addon.price)}</span>
                              </div>
                              <p className="text-[11px] text-muted leading-tight mt-0.5">{addon.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total calculation */}
                  <div className="space-y-2 pt-3 border-t border-line text-sm">
                    <div className="flex justify-between text-muted">
                      <span>Bunk Bed ({nights} nights)</span>
                      <span>{formatMoney(bedSubtotal)}</span>
                    </div>
                    {addonsTotal > 0 && (
                      <div className="flex justify-between text-muted">
                        <span>Add-ons</span>
                        <span>{formatMoney(addonsTotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-extrabold text-ink pt-2 border-t border-dashed border-line">
                      <span>Total Amount</span>
                      <span>{formatMoney(grandTotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-brand-strong font-semibold bg-brand/10 p-2.5 rounded-xl">
                      <span>Deposit Due Now ({depositPercent}%)</span>
                      <span>{formatMoney(depositAmount)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep('details')}
                    className="w-full justify-center shadow-pop text-sm font-bold py-3.5"
                  >
                    Continue to Guest Details <ChevronRight className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center text-muted text-xs space-y-2">
                  <Bed className="size-8 mx-auto text-slate-300" />
                  <p className="font-semibold text-ink">No bed selected</p>
                  <p>Choose an available green bed from the graphical plan to view rates.</p>
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
              ← Back to bed selection
            </button>
            <h2 className="text-2xl font-bold text-ink">Guest Details & Confirmation</h2>
            <p className="text-xs text-muted">Enter who is staying in Bed {selectedBed?.bedNumber}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+44 7700 900123"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Gender (for dorm allocation) *</label>
                <select
                  value={guestGender}
                  onChange={(e) => setGuestGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none bg-white"
                >
                  <option value="unspecified">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="non_binary">Non-binary</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">Estimated Arrival Time</label>
              <select
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none bg-white"
              >
                <option value="14:00 - 16:00">14:00 – 16:00 (Standard check-in)</option>
                <option value="16:00 - 18:00">16:00 – 18:00</option>
                <option value="18:00 - 20:00">18:00 – 20:00 (Evening)</option>
                <option value="20:00 - 23:00">20:00 – 23:00 (Late arrival)</option>
                <option value="After 23:00">After 23:00 (Self keycard entry)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">Special Requests or Notes</label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Quiet corner, allergies, or early baggage drop-off…"
                className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              />
            </div>

            {/* Seamless Account Creation for Guests */}
            {!me && (
              <div className="p-4 bg-cream/70 rounded-2xl border border-amber-200/60 space-y-2">
                <p className="font-bold text-xs text-ink">Create your account password</p>
                <p className="text-[11px] text-muted">
                  You will use this password to view your hostel reservation, door access codes, and payment receipt in your dashboard.
                </p>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password (min. 8 characters)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-sm bg-white focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                />
              </div>
            )}
          </div>

          {/* Final Payment & Submission */}
          <div className="pt-6 border-t border-line space-y-4">
            <div className="flex items-center justify-between text-base font-bold text-ink">
              <span>Total Price ({nights} nights)</span>
              <span>{formatMoney(grandTotal)}</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
              <div>
                <p className="font-bold">Deposit to secure bed today</p>
                <p className="text-emerald-700">Remaining balance settled upon arrival.</p>
              </div>
              <p className="text-xl font-extrabold text-emerald-900">{formatMoney(depositAmount)}</p>
            </div>

            <Button
              onClick={handleBook}
              disabled={submitting}
              className="w-full justify-center shadow-pop text-base font-bold py-4"
            >
              {submitting ? (
                <Spinner label="Securing your bed..." />
              ) : paymentsEnabled ? (
                <>
                  <CreditCard className="size-5" /> Pay Deposit with PayPal ({formatMoney(depositAmount)})
                </>
              ) : (
                <>
                  <Check className="size-5" /> Confirm Bed Reservation
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-muted flex items-center justify-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600" /> Free cancellation up to 24 hours prior to check-in.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
