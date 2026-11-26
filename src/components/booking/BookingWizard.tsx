'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock, PawPrint } from 'lucide-react';
import { BRAND, formatMoney, LIMITS } from '@/lib/config';
import { formatDateLong, formatTimeRange } from '@/lib/dates';
import { FREQUENCIES, quote, type Frequency, type Rooms } from '@/lib/pricing';
import { ACCESS_LABEL, type AccessMethod, type Catalog, type MeResponse, type Slot } from '@/lib/types';
import { api, ApiError } from '@/lib/api';
import { ServiceIcon } from '@/components/ServiceIcon';
import { Alert, Button, Card, cx, Spinner, Stepper, TextArea, TextField } from '@/components/ui';
import { DateTimePicker } from './DatePicker';
import { useI18n } from '@/lib/i18n';

interface Draft {
  serviceId: string;
  rooms: Rooms;
  frequency: Frequency;
  addonIds: string[];
  date: string | null;
  startMin: number | null;
  street: string;
  city: string;
  postcode: string;
  accessMethod: AccessMethod;
  accessNotes: string;
  hasPets: boolean;
  notes: string;
}

interface Account {
  name: string;
  email: string;
  phone: string;
  password: string;
}

type CatalogResponse = Catalog & { bookable: { first: string; last: string } };

const STORAGE_KEY = 'ps-booking-draft';
const KEY_STORAGE = 'ps-booking-key';

const FIELD_STEP: Record<string, number> = {
  serviceId: 0,
  rooms: 0,
  addonIds: 0,
  frequency: 0,
  date: 1,
  startMin: 1,
  street: 2,
  city: 2,
  postcode: 2,
  accessMethod: 2,
  accessNotes: 2,
  notes: 2,
  name: 3,
  email: 3,
  phone: 3,
  password: 3,
};

const emptyDraft = (serviceId: string, postcode: string): Draft => ({
  serviceId,
  rooms: { bedrooms: 2, bathrooms: 1, kitchens: 1, livingRooms: 1, extraAreas: 0 },
  frequency: 'one_off',
  addonIds: [],
  date: null,
  startMin: null,
  street: '',
  city: '',
  postcode,
  accessMethod: 'home',
  accessNotes: '',
  hasPets: false,
  notes: '',
});

function loadStored<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function BookingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const { t, l, locale } = useI18n();
  const b = t.booking;

  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [me, setMe] = useState<MeResponse['user'] | undefined>(undefined);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [account, setAccount] = useState<Account>({ name: '', email: '', phone: '', password: '' });
  const [step, setStep] = useState(0);
  const [slotState, setSlotState] = useState<{ key: string; slots: Slot[] } | null>(null);
  const [slotsRefresh, setSlotsRefresh] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);

  // Load catalogue + who is logged in, then restore any saved progress.
  useEffect(() => {
    Promise.all([api<CatalogResponse>('/api/catalog'), api<MeResponse>('/api/auth/me')])
      .then(([cat, who]) => {
        setCatalog(cat);
        setMe(who.user);
        const wanted = params.get('service');
        const fallback = cat.services.find((s) => s.id === wanted)?.id ?? cat.services[0]?.id ?? '';
        const stored = loadStored<Draft>(STORAGE_KEY);
        const base = stored && !wanted ? stored : emptyDraft(fallback, (params.get('postcode') ?? '').slice(0, 10).toUpperCase());
        if (!cat.services.some((s) => s.id === base.serviceId)) base.serviceId = fallback;
        base.addonIds = base.addonIds.filter((id) => cat.addons.some((a) => a.id === id));
        setDraft(base);
      })
      .catch((e: ApiError) => setLoadError(e.message));
  }, [params]);

  useEffect(() => {
    if (draft) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const update = useCallback((patch: Partial<Draft>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[k];
      return next;
    });
  }, []);

  const service = catalog?.services.find((s) => s.id === draft?.serviceId);
  const chosenAddons = useMemo(() => {
    if (!catalog || !draft) return [];
    return draft.addonIds
      .map((id) => catalog.addons.find((a) => a.id === id))
      .filter((a): a is (typeof catalog.addons)[number] => Boolean(a));
  }, [catalog, draft]);

  const q = useMemo(() => {
    if (!service || !draft) return null;
    return quote(service, draft.rooms, chosenAddons, draft.frequency);
  }, [service, draft, chosenAddons]);

  const slotKey = draft && q ? `${draft.date ?? ''}:${q.durationMin}:${slotsRefresh}` : '';
  const slots = slotState?.key === slotKey ? slotState.slots : [];
  const loadingSlots = Boolean(draft?.date && slotState?.key !== slotKey);

  useEffect(() => {
    if (!draft?.date || !q) return;
    let cancelled = false;
    const key = slotKey;
    api<{ slots: Slot[] }>('/api/availability', {
      body: {
        date: draft.date,
        serviceId: draft.serviceId,
        rooms: draft.rooms,
        addonIds: draft.addonIds,
        frequency: draft.frequency,
      },
    })
      .then((res) => {
        if (cancelled) return;
        setSlotState({ key, slots: res.slots });
        // If the previously picked slot is no longer available, unpick it.
        setDraft((d) => {
          if (!d || d.startMin === null) return d;
          return res.slots.some((s) => s.startMin === d.startMin && s.available) ? d : { ...d, startMin: null };
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSlotState({ key, slots: [] });
          if (err instanceof ApiError) setFormError(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotKey]);

  const goTo = (n: number) => {
    setStep(n);
    setFormError(null);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  function validateStep(n: number): boolean {
    if (!draft) return false;
    const e: Record<string, string> = {};
    if (n === 1) {
      if (!draft.date) e.date = locale === 'cn' ? '请选择预约上门日期。' : 'Please pick a day.';
      else if (draft.startMin === null) e.startMin = locale === 'cn' ? '请选择上门时段。' : 'Please pick an arrival time.';
    }
    if (n === 2) {
      if (draft.street.trim().length < 3) e.street = locale === 'cn' ? '请输入详细街道与门牌地址。' : 'Please enter your street address.';
      if (draft.city.trim().length < 2) e.city = locale === 'cn' ? '请输入所在城市或区域。' : 'Please enter your town or city.';
      if (draft.postcode.trim().length < 2) e.postcode = locale === 'cn' ? '请输入正确的英国邮编。' : 'Please enter your postcode.';
      if (draft.accessMethod !== 'home' && draft.accessNotes.trim().length < 3)
        e.accessNotes = locale === 'cn' ? '请填写入室说明或钥匙密码。' : 'Please tell us how your cleaner can get in.';
    }
    if (n === 3 && !me) {
      if (account.name.trim().length < 2) e.name = locale === 'cn' ? '请输入您的姓名。' : 'Please enter your name.';
      if (!/^\S+@\S+\.\S+$/.test(account.email.trim())) e.email = locale === 'cn' ? '请输入有效的电子邮箱地址。' : 'Please enter a valid email address.';
      if (account.phone.replace(/\D/g, '').length < 7) e.phone = locale === 'cn' ? '请输入可联系到您的有效电话号码。' : 'Please enter a phone number we can reach you on.';
      if (account.password.length < 8) e.password = locale === 'cn' ? '请设置至少8位数的密码。' : 'Please choose a password with at least 8 characters.';
    }
    setErrors(e);
    if (Object.keys(e).length) {
      setFormError(locale === 'cn' ? '请修改下方标红的必填项。' : 'Please fix the highlighted items below.');
      return false;
    }
    return true;
  }

  const next = () => validateStep(step) && goTo(step + 1);

  async function submit() {
    if (inFlight.current || !draft || !validateStep(3)) return;
    inFlight.current = true;
    setSubmitting(true);
    setFormError(null);
    let requestKey = loadStored<string>(KEY_STORAGE);
    if (!requestKey) {
      requestKey = crypto.randomUUID();
      sessionStorage.setItem(KEY_STORAGE, JSON.stringify(requestKey));
    }
    try {
      const res = await api<{ ref: string; checkoutUrl?: string | null }>('/api/bookings', {
        body: { ...draft, requestKey, account: me ? undefined : account },
      });
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(KEY_STORAGE);
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        router.push(l(`/account?booked=${encodeURIComponent(res.ref)}`));
      }
    } catch (err) {
      const e = err as ApiError;
      inFlight.current = false;
      setSubmitting(false);
      if (e.status === 409 && e.field === 'startMin') {
        setDraft((d) => (d ? { ...d, startMin: null } : d));
        setErrors({ startMin: e.message });
        goTo(1);
        setFormError(e.message);
        setSlotsRefresh((n) => n + 1);
        return;
      }
      if (e.field && FIELD_STEP[e.field] !== undefined) {
        setErrors({ [e.field]: e.message });
        if (FIELD_STEP[e.field] !== step) goTo(FIELD_STEP[e.field]);
      }
      setFormError(e.message);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <Alert tone="error" title={locale === 'cn' ? '无法载入预约表单' : 'We could not load the booking form'}>
          {loadError} {t.common.preferToTalk} {BRAND.phone}.
        </Alert>
      </div>
    );
  }
  if (!catalog || !draft || !service || !q || me === undefined) return <Spinner label={t.common.bookAClean + '...'} />;

  const depositPercent = catalog.depositPercent ?? 20;
  const paymentsEnabled = catalog.paymentsEnabled ?? false;
  const depositAmount = depositPercent >= 100 ? q.total : Math.round(q.total * (depositPercent / 100) * 100) / 100;
  const balanceAmount = Math.round((q.total - depositAmount) * 100) / 100;

  const localizedServiceName = (sId: string, defTitle: string) =>
    t.servicesCatalog[sId]?.title || defTitle;

  const localizedServiceShort = (sId: string, defShort: string) =>
    t.servicesCatalog[sId]?.short || defShort;

  const localizedAddonName = (aId: string, defName: string) =>
    t.addonsCatalog[aId]?.name || defName;

  const localizedAddonDesc = (aId: string, defDesc: string) =>
    t.addonsCatalog[aId]?.description || defDesc;

  const localizedAccessLabel = (m: AccessMethod) => b.accessMethods[m] || ACCESS_LABEL[m];

  return (
    <div ref={topRef} className="scroll-mt-28 mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <Progress steps={b.steps} step={step} locale={locale} onJump={(n) => n < step && goTo(n)} />

      <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="min-w-0">
          {formError && (
            <Alert tone="error" className="mb-6">
              {formError}
            </Alert>
          )}

          {step === 0 && (
            <div className="space-y-10 animate-fade-up">
              <Section title={locale === 'cn' ? '您需要哪种清洁服务？' : 'What type of cleaning do you need?'}>
                <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Type of cleaning">
                  {catalog.services.map((s) => {
                    const title = localizedServiceName(s.id, s.title);
                    const short = localizedServiceShort(s.id, s.short);
                    return (
                      <ChoiceCard key={s.id} selected={s.id === draft.serviceId} onClick={() => update({ serviceId: s.id })} role="radio">
                        <span className={cx('flex size-12 shrink-0 items-center justify-center rounded-xl', s.id === draft.serviceId ? 'bg-brand-strong text-white' : 'bg-brand-tint text-brand-strong')}>
                          <ServiceIcon name={s.icon} className="size-6" />
                        </span>
                        <span className="flex-1">
                          <span className="block font-semibold text-lg">{title}</span>
                          <span className="block text-muted text-sm">{short}</span>
                          <span className="block mt-1 font-medium">{formatMoney(s.hourlyRate)} {t.common.perHour}</span>
                        </span>
                      </ChoiceCard>
                    );
                  })}
                </div>
              </Section>

              <Section title={locale === 'cn' ? '您的房屋空间有多大？' : 'How big is your home?'}>
                <Card className="px-5 divide-y divide-line">
                  <Stepper label={b.bedrooms} value={draft.rooms.bedrooms} min={0} max={LIMITS.maxBedrooms} onChange={(n) => update({ rooms: { ...draft.rooms, bedrooms: n } })} />
                  <Stepper label={b.bathrooms} value={draft.rooms.bathrooms} min={1} max={LIMITS.maxBathrooms} onChange={(n) => update({ rooms: { ...draft.rooms, bathrooms: n } })} />
                  <Stepper label={b.kitchens} value={draft.rooms.kitchens} min={0} max={LIMITS.maxKitchens} onChange={(n) => update({ rooms: { ...draft.rooms, kitchens: n } })} />
                  <Stepper label={b.livingRooms} value={draft.rooms.livingRooms} min={0} max={LIMITS.maxLivingRooms} onChange={(n) => update({ rooms: { ...draft.rooms, livingRooms: n } })} />
                  <Stepper label={b.extraAreas} value={draft.rooms.extraAreas} min={0} max={LIMITS.maxExtraAreas} onChange={(n) => update({ rooms: { ...draft.rooms, extraAreas: n } })} />
                </Card>
              </Section>

              <Section
                title={locale === 'cn' ? '服务频次？' : 'How often?'}
                sub={locale === 'cn' ? '定期清洁享更高折扣。当前仅预订首次上门。' : 'Regular cleans are cheaper. You only book the first visit now.'}
              >
                <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="How often">
                  {FREQUENCIES.map((f) => {
                    const label = b.frequencies[f.id] || f.label;
                    return (
                      <ChoiceCard key={f.id} selected={f.id === draft.frequency} onClick={() => update({ frequency: f.id })} role="radio">
                        <Radio checked={f.id === draft.frequency} />
                        <span className="flex-1 font-semibold text-lg">{label}</span>
                        {f.discountPercent > 0 && (
                          <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success">
                            {locale === 'cn' ? `省 ${f.discountPercent}%` : f.note}
                          </span>
                        )}
                      </ChoiceCard>
                    );
                  })}
                </div>
              </Section>

              <Section
                title={locale === 'cn' ? '自选附加清洁项目？' : 'Any extras?'}
                sub={locale === 'cn' ? '选填。勾选您需要的深度附加清洁。' : 'Optional. Tick any you would like.'}
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  {catalog.addons.map((a) => {
                    const on = draft.addonIds.includes(a.id);
                    const name = localizedAddonName(a.id, a.name);
                    return (
                      <ChoiceCard
                        key={a.id}
                        selected={on}
                        role="checkbox"
                        onClick={() => update({ addonIds: on ? draft.addonIds.filter((x) => x !== a.id) : [...draft.addonIds, a.id] })}
                      >
                        <span className={cx('flex size-7 shrink-0 items-center justify-center rounded-md border-2', on ? 'bg-brand-strong border-brand-strong text-white' : 'border-ink/30')}>
                          {on && <Check className="size-5" strokeWidth={3} aria-hidden />}
                        </span>
                        <span className="flex-1">
                          <span className="block font-semibold">{name}</span>
                          <span className="block text-[0.95rem] text-muted">
                            {localizedAddonDesc(a.id, a.description)}
                          </span>
                        </span>
                        <span className="font-semibold">+{formatMoney(a.price)}</span>
                      </ChoiceCard>
                    );
                  })}
                </div>
              </Section>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-up">
              <DateTimePicker
                window={catalog.bookable}
                date={draft.date}
                startMin={draft.startMin}
                slots={slots}
                loadingSlots={loadingSlots}
                durationMin={q.durationMin}
                onDate={(d) => {
                  if (d !== draft.date) update({ date: d, startMin: null });
                }}
                onTime={(m) => update({ startMin: m })}
              />
              {(errors.date || errors.startMin) && (
                <Alert tone="error" className="mt-6">
                  {errors.date || errors.startMin}
                </Alert>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fade-up">
              <Section title={locale === 'cn' ? '保洁师上门地址？' : 'Where should we come?'}>
                <div className="grid gap-5">
                  <TextField
                    label={b.street}
                    autoComplete="street-address"
                    value={draft.street}
                    onChange={(e) => update({ street: e.target.value })}
                    error={errors.street}
                    maxLength={120}
                    placeholder={locale === 'cn' ? '例如：12 Rose Lane, Flat 3' : 'e.g. 12 Rose Lane, Flat 3'}
                  />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <TextField label={b.city} autoComplete="address-level2" value={draft.city} onChange={(e) => update({ city: e.target.value })} error={errors.city} maxLength={60} />
                    <TextField label={b.postcode} autoComplete="postal-code" value={draft.postcode} onChange={(e) => update({ postcode: e.target.value.toUpperCase() })} error={errors.postcode} maxLength={10} />
                  </div>
                </div>
              </Section>

              <Section title={locale === 'cn' ? '保洁师如何入室？' : 'How will your cleaner get in?'}>
                <div className="grid sm:grid-cols-2 gap-3" role="radiogroup" aria-label="How will your cleaner get in">
                  {(Object.keys(ACCESS_LABEL) as AccessMethod[]).map((m) => (
                    <ChoiceCard key={m} selected={draft.accessMethod === m} onClick={() => update({ accessMethod: m })} role="radio">
                      <Radio checked={draft.accessMethod === m} />
                      <span className="font-semibold text-lg">{localizedAccessLabel(m)}</span>
                    </ChoiceCard>
                  ))}
                </div>
                {draft.accessMethod !== 'home' && (
                  <div className="mt-5">
                    <TextArea
                      label={b.accessNotes}
                      hint={locale === 'cn' ? '例如：后门钥匙盒密码 1234。该信息仅您指定的保洁师可见。' : 'For example: key safe by the back door, code 1234. Only your cleaner and our team can see this.'}
                      value={draft.accessNotes}
                      onChange={(e) => update({ accessNotes: e.target.value })}
                      error={errors.accessNotes}
                      maxLength={300}
                    />
                    <p className="mt-2 flex items-center gap-1.5 text-[0.95rem] text-muted">
                      <Lock className="size-4" aria-hidden />
                      {locale === 'cn' ? '全程加密储存，绝不对外公开。' : 'Kept private and never shown publicly.'}
                    </p>
                  </div>
                )}
              </Section>

              <Section title={locale === 'cn' ? '其他注意事项？' : 'Anything else?'}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={draft.hasPets}
                  onClick={() => update({ hasPets: !draft.hasPets })}
                  className={cx('mb-5 flex w-full items-center gap-4 rounded-card border-2 p-4 text-left', draft.hasPets ? 'border-brand-strong bg-brand-tint' : 'border-line bg-white hover:border-ink/40')}
                >
                  <span className={cx('flex size-7 shrink-0 items-center justify-center rounded-md border-2', draft.hasPets ? 'bg-brand-strong border-brand-strong text-white' : 'border-ink/30')}>
                    {draft.hasPets && <Check className="size-5" strokeWidth={3} aria-hidden />}
                  </span>
                  <PawPrint className="size-6 text-muted" aria-hidden />
                  <span className="font-semibold text-lg">{b.hasPets}</span>
                </button>
                <TextArea
                  label={b.notes}
                  optional
                  value={draft.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                  error={errors.notes}
                  maxLength={500}
                  placeholder={locale === 'cn' ? '例如：请着重清理厨房油烟机和卫生间水垢' : 'e.g. please focus on the kitchen'}
                />
              </Section>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fade-up">
              {me ? (
                <Alert tone="info" title={`${locale === 'cn' ? '当前登录为' : 'Booking as'} ${me.name}`}>
                  {me.email}
                </Alert>
              ) : (
                <Section
                  title={b.name}
                  sub={locale === 'cn' ? '我们将为您创建账户，方便随时查看、改期或取消本次预约。' : 'We will create your account so you can see, change or cancel your booking at any time.'}
                >
                  <p className="mb-5 rounded-card bg-soft p-4">
                    {locale === 'cn' ? '已有账户？' : 'Already booked with us?'}{' '}
                    <Link href={l(`/login?next=${encodeURIComponent(l('/book'))}`)} className="font-semibold text-brand-strong underline underline-offset-4">
                      {locale === 'cn' ? '点击在此登录' : 'Log in here'}
                    </Link>{' '}
                    {locale === 'cn' ? '登录后将自动关联。' : 'and your booking will be saved.'}
                  </p>
                  <div className="grid gap-5">
                    <TextField label={b.name} autoComplete="name" value={account.name} onChange={(e) => setAccount({ ...account, name: e.target.value })} error={errors.name} maxLength={80} />
                    <div className="grid sm:grid-cols-2 gap-5">
                      <TextField label={b.email} type="email" autoComplete="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} error={errors.email} maxLength={254} />
                      <TextField label={b.phone} type="tel" autoComplete="tel" value={account.phone} onChange={(e) => setAccount({ ...account, phone: e.target.value })} error={errors.phone} maxLength={25} />
                    </div>
                    <TextField
                      label={b.password}
                      hint={locale === 'cn' ? '至少8位字符。用于登录管理本次及以后的保洁订单。' : 'At least 8 characters. You will use this to log in and manage your booking.'}
                      type="password"
                      autoComplete="new-password"
                      value={account.password}
                      onChange={(e) => setAccount({ ...account, password: e.target.value })}
                      error={errors.password}
                    />
                  </div>
                </Section>
              )}

              <Section title={b.reviewTitle}>
                <Card className="divide-y divide-line">
                  <ReviewRow label={locale === 'cn' ? '服务' : 'Service'} onEdit={() => goTo(0)} changeLabel={locale === 'cn' ? '修改' : 'Change'}>
                    {localizedServiceName(service.id, service.title)} · {b.frequencies[draft.frequency]}
                  </ReviewRow>
                  <ReviewRow label={locale === 'cn' ? '房屋' : 'Home'} onEdit={() => goTo(0)} changeLabel={locale === 'cn' ? '修改' : 'Change'}>
                    {roomSummary(draft.rooms, locale)}
                    {chosenAddons.length > 0 && (
                      <span className="block text-muted">
                        {locale === 'cn' ? '附加项目：' : 'Extras: '}
                        {chosenAddons.map((a) => localizedAddonName(a.id, a.name)).join(', ')}
                      </span>
                    )}
                  </ReviewRow>
                  <ReviewRow label={locale === 'cn' ? '时间' : 'When'} onEdit={() => goTo(1)} changeLabel={locale === 'cn' ? '修改' : 'Change'}>
                    {draft.date && draft.startMin !== null && (
                      <>
                        {formatDateLong(draft.date)}
                        <span className="block text-muted">{formatTimeRange(draft.startMin, q.durationMin)}</span>
                      </>
                    )}
                  </ReviewRow>
                  <ReviewRow label={locale === 'cn' ? '地址' : 'Where'} onEdit={() => goTo(2)} changeLabel={locale === 'cn' ? '修改' : 'Change'}>
                    {draft.street}, {draft.city}, {draft.postcode}
                    <span className="block text-muted">{localizedAccessLabel(draft.accessMethod)}</span>
                  </ReviewRow>
                </Card>
                {paymentsEnabled && depositPercent < 100 && (
                  <div className="mt-4 rounded-xl border border-line bg-soft/50 p-4 space-y-2 text-sm">
                    <div className="flex justify-between font-semibold text-brand-deep">
                      <span>{locale === 'cn' ? `今日预付定金 (${depositPercent}%)` : `Deposit due now (${depositPercent}%)`}</span>
                      <span>{formatMoney(depositAmount)}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>{locale === 'cn' ? '清洁完成满意后再付余款' : 'Remaining balance due after clean'}</span>
                      <span>{formatMoney(balanceAmount)}</span>
                    </div>
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* Desktop nav buttons */}
          <div className="mt-10 hidden lg:flex items-center justify-between gap-4">
            {step > 0 ? (
              <Button variant="secondary" size="lg" onClick={() => goTo(step - 1)}>
                <ArrowLeft className="size-5" aria-hidden /> {b.backBtn}
              </Button>
            ) : (
              <span />
            )}
            {step < 3 ? (
              <Button size="lg" onClick={next}>
                {b.continueBtn} <ArrowRight className="size-5" aria-hidden />
              </Button>
            ) : (
              <Button size="lg" onClick={submit} loading={submitting}>
                <Lock className="size-4" aria-hidden />
                {paymentsEnabled
                  ? depositPercent >= 100
                    ? `${locale === 'cn' ? '支付并确认' : 'Pay & confirm'} · ${formatMoney(q.total)}`
                    : `${locale === 'cn' ? '支付定金' : 'Pay deposit'} · ${formatMoney(depositAmount)}`
                  : `${b.confirmBtn} · ${formatMoney(q.total)}`}
              </Button>
            )}
          </div>
        </div>

        <Summary
          draft={draft}
          serviceTitle={localizedServiceName(service.id, service.title)}
          q={q}
          addons={chosenAddons.map((a) => ({ ...a, name: localizedAddonName(a.id, a.name) }))}
          depositPercent={depositPercent}
          paymentsEnabled={paymentsEnabled}
          locale={locale}
        />
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={() => goTo(step - 1)} className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-line" aria-label="Back">
              <ArrowLeft className="size-6" aria-hidden />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted">
              {paymentsEnabled && depositPercent < 100
                ? locale === 'cn' ? '今日定金' : 'Deposit'
                : locale === 'cn' ? '预估总价' : 'Total'}
            </p>
            <p className="text-xl font-semibold leading-tight">
              {formatMoney(paymentsEnabled && depositPercent < 100 ? depositAmount : q.total)}
            </p>
          </div>
          {step < 3 ? (
            <Button size="lg" onClick={next} className="px-7">
              {b.continueBtn}
            </Button>
          ) : (
            <Button size="lg" onClick={submit} loading={submitting} className="px-7">
              {paymentsEnabled ? (locale === 'cn' ? '支付定金' : 'Pay deposit') : b.confirmBtn}
            </Button>
          )}
        </div>
      </div>
      <div className="h-24 lg:hidden" aria-hidden />
    </div>
  );
}

function Progress({
  steps,
  step,
  locale,
  onJump,
}: {
  steps: [string, string, string, string];
  step: number;
  locale?: string;
  onJump: (n: number) => void;
}) {
  return (
    <nav aria-label="Booking progress">
      <p className="text-muted font-medium sm:hidden">
        {locale === 'cn' ? `第 ${step + 1} 步 / 共 ${steps.length} 步` : `Step ${step + 1} of ${steps.length}`}
      </p>
      <h1 className="text-3xl sm:text-4xl font-semibold mt-1 sm:hidden">{steps[step]}</h1>
      <ol className="hidden sm:flex items-center gap-2">
        {steps.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className="flex items-center gap-2 flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => onJump(i)}
                disabled={!done}
                aria-current={current ? 'step' : undefined}
                className={cx('flex items-center gap-2.5 rounded-full py-1 pr-2 font-semibold', done && 'hover:underline', !done && !current && 'text-muted')}
              >
                <span
                  className={cx(
                    'flex size-9 items-center justify-center rounded-full text-[0.95rem] border-2',
                    current && 'bg-brand-strong border-brand-strong text-white',
                    done && 'bg-success border-success text-white',
                    !done && !current && 'border-line',
                  )}
                >
                  {done ? <Check className="size-5" strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                <span className="whitespace-nowrap">{label}</span>
              </button>
              {i < steps.length - 1 && <span className={cx('h-0.5 flex-1 rounded', done ? 'bg-success' : 'bg-line')} aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold">{title}</h2>
      {sub && <p className="mt-1 text-muted">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ChoiceCard({ selected, onClick, role, children }: { selected: boolean; onClick: () => void; role: 'radio' | 'checkbox'; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onClick}
      className={cx(
        'flex w-full items-center gap-4 rounded-card border-2 p-4 text-left transition-colors',
        selected ? 'border-brand-strong bg-brand-tint' : 'border-line bg-white hover:border-ink/40',
      )}
    >
      {children}
    </button>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <span className={cx('flex size-7 shrink-0 items-center justify-center rounded-full border-2', checked ? 'border-brand-strong' : 'border-ink/30')}>
      {checked && <span className="size-3.5 rounded-full bg-brand-strong" />}
    </span>
  );
}

function ReviewRow({
  label,
  onEdit,
  changeLabel = 'Change',
  children,
}: {
  label: string;
  onEdit: () => void;
  changeLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 p-5">
      <p className="w-20 shrink-0 text-muted">{label}</p>
      <div className="flex-1 font-medium">{children}</div>
      <button type="button" onClick={onEdit} className="font-semibold text-brand-strong underline underline-offset-4">
        {changeLabel}
      </button>
    </div>
  );
}

function roomSummary(r: Rooms, locale?: string) {
  if (locale === 'cn') {
    const parts = [
      [r.bedrooms, '间卧室'],
      [r.bathrooms, '间卫生间'],
      [r.kitchens, '间厨房'],
      [r.livingRooms, '间客厅'],
      [r.extraAreas, '个额外房间'],
    ] as const;
    return parts
      .filter(([n]) => n > 0)
      .map(([n, w]) => `${n} ${w}`)
      .join('，');
  }

  const parts = [
    [r.bedrooms, 'bedroom'],
    [r.bathrooms, 'bathroom'],
    [r.kitchens, 'kitchen'],
    [r.livingRooms, 'living room'],
    [r.extraAreas, 'other room'],
  ] as const;
  return parts
    .filter(([n]) => n > 0)
    .map(([n, w]) => `${n} ${w}${n === 1 ? '' : 's'}`)
    .join(', ');
}

function Summary({
  draft,
  serviceTitle,
  q,
  addons,
  depositPercent,
  paymentsEnabled,
  locale,
}: {
  draft: Draft;
  serviceTitle: string;
  q: ReturnType<typeof quote>;
  addons: { id: string; name: string; price: number }[];
  depositPercent?: number;
  paymentsEnabled?: boolean;
  locale?: string;
}) {
  const percent = depositPercent ?? 20;
  const depositAmount = percent >= 100 ? q.total : Math.round(q.total * (percent / 100) * 100) / 100;
  const balanceAmount = Math.round((q.total - depositAmount) * 100) / 100;

  return (
    <aside className="lg:sticky lg:top-28 hidden lg:block" aria-label="Booking summary">
      <Card className="p-6">
        <h2 className="text-xl font-semibold">{locale === 'cn' ? '您的预约概要' : 'Your booking'}</h2>
        <dl className="mt-5 space-y-3">
          <Row label={locale === 'cn' ? '服务类型' : 'Service'} value={serviceTitle} />
          <Row label={locale === 'cn' ? '房屋规格' : 'Home'} value={roomSummary(draft.rooms, locale)} />
          {draft.date && <Row label={locale === 'cn' ? '上门日期' : 'Date'} value={formatDateLong(draft.date)} />}
          {draft.date && draft.startMin !== null && (
            <Row label={locale === 'cn' ? '到达时段' : 'Time'} value={formatTimeRange(draft.startMin, q.durationMin)} />
          )}
          <Row label={locale === 'cn' ? '预计工时' : 'Length'} value={locale === 'cn' ? `约 ${q.hours} 小时` : `About ${q.hours} hours`} />
        </dl>
        <dl className="mt-5 space-y-2 border-t border-line pt-5">
          <Row label={locale === 'cn' ? '保洁基础费用' : 'Cleaning'} value={formatMoney(q.labour)} />
          {addons.map((a) => (
            <Row key={a.id} label={a.name} value={formatMoney(a.price)} />
          ))}
          {q.discount > 0 && (
            <Row
              label={locale === 'cn' ? `定期保洁折扣 (${q.discountPercent}%)` : `Regular discount (${q.discountPercent}%)`}
              value={`−${formatMoney(q.discount)}`}
              tone="success"
            />
          )}
        </dl>
        <div className="mt-5 flex items-end justify-between border-t border-line pt-5">
          <span className="font-semibold text-lg">{locale === 'cn' ? '费用总计' : 'Total'}</span>
          <span className="text-3xl font-semibold">{formatMoney(q.total)}</span>
        </div>

        {paymentsEnabled && percent < 100 && (
          <dl className="mt-4 space-y-2 rounded-xl bg-soft p-3.5 text-sm">
            <div className="flex justify-between font-semibold text-brand-deep">
              <dt>{locale === 'cn' ? `今日预付定金 (${percent}%)` : `Deposit due now (${percent}%)`}</dt>
              <dd>{formatMoney(depositAmount)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>{locale === 'cn' ? '清洁完成满意后再付余款' : 'Balance due after clean'}</dt>
              <dd>{formatMoney(balanceAmount)}</dd>
            </div>
          </dl>
        )}

        <div className="mt-4 rounded-lg bg-soft px-4 py-3 text-xs text-muted space-y-1">
          <p className="font-semibold text-ink flex items-center gap-1.5">
            <Lock className="size-3.5 text-brand-strong" aria-hidden />
            {paymentsEnabled
              ? locale === 'cn' ? '通过 PayPal 安全支付' : 'Secure payment via PayPal'
              : locale === 'cn' ? '清洁完成满意后再付款' : 'Pay after your clean'}
          </p>
          <p>
            {paymentsEnabled
              ? percent < 100
                ? locale === 'cn'
                  ? `今日仅收取 ${percent}% 定金以锁定保洁师档期。剩余款项在保洁完成满意后支付。`
                  : `Only ${percent}% deposit is charged now. Remaining balance is payable after your clean.`
                : locale === 'cn'
                ? '通过 PayPal 国际加密支付网关安全结算（支持余额或各类银行卡）。'
                : 'Full payment processed securely via PayPal (pay with your PayPal balance or a card).'
              : locale === 'cn'
              ? '无任何前期费用。保洁完工验收满意后再付款。'
              : 'No upfront charge. Pay directly after your clean.'}
          </p>
        </div>
      </Card>
    </aside>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'success' }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={cx('text-right font-medium', tone === 'success' && 'text-success')}>{value}</dd>
    </div>
  );
}
