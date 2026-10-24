'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, ClipboardList, LayoutDashboard, PoundSterling, Search, UserPlus, Users } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { formatMoney } from '@/lib/config';
import { addDays, formatDateLong, formatTimeRange, nowInBusinessTz } from '@/lib/dates';
import { STATUS_LABEL, type BookingStatus, type BookingView, type Catalog, type MeResponse } from '@/lib/types';
import { StatusBadge } from '@/components/BookingBits';
import { PortalShell } from '@/components/portal/PortalShell';
import { Alert, Button, Card, cx, Modal, Spinner, TextField } from '@/components/ui';

type Tab = 'overview' | 'bookings' | 'cleaners' | 'prices' | 'customers';
const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'cleaners', label: 'Cleaners', icon: Users },
  { id: 'prices', label: 'Prices', icon: PoundSterling },
  { id: 'customers', label: 'Customers', icon: CalendarDays },
];

const selectClass = 'min-h-11 rounded-[10px] border-2 border-line bg-white px-3 font-medium focus:outline-none focus:border-brand-strong';

/** Redirects to the admin login if the session has expired. */
function useAdminApi() {
  const router = useRouter();
  return useCallback(
    async <T,>(url: string, init?: { method?: string; body?: unknown }) => {
      try {
        return await api<T>(url, init);
      } catch (err) {
        if ((err as ApiError).status === 401 || (err as ApiError).status === 403) router.replace('/admin/login?next=/admin');
        throw err;
      }
    },
    [router],
  );
}

export function AdminDashboard() {
  const call = useAdminApi();
  const [me, setMe] = useState<MeResponse['user']>(null);
  const [tab, setTab] = useState<Tab>('overview');

  useEffect(() => {
    call<MeResponse>('/api/auth/me').then((r) => {
      if (r.user?.role === 'admin') setMe(r.user);
      else call('/api/admin/stats').catch(() => {});
    }, () => {});
  }, [call]);

  if (!me) return <Spinner />;

  return (
    <PortalShell area="Admin" name={me.name} dark>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <nav className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" aria-label="Admin sections">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={cx(
                'inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition',
                tab === id ? 'bg-ink text-white' : 'bg-white text-ink border border-line hover:border-ink/40',
              )}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </nav>
        <div className="mt-6">
          {tab === 'overview' && <Overview call={call} />}
          {tab === 'bookings' && <Bookings call={call} />}
          {tab === 'cleaners' && <Cleaners call={call} />}
          {tab === 'prices' && <Prices call={call} />}
          {tab === 'customers' && <Customers call={call} />}
        </div>
      </div>
    </PortalShell>
  );
}

type Call = ReturnType<typeof useAdminApi>;

// ---------- Overview ----------

interface Stats {
  today: string;
  jobsToday: number;
  upcoming: number;
  revenueMonth: number;
  activeCleaners: number;
  customers: number;
  recent: { at: string; action: string; details: string }[];
}

function Overview({ call }: { call: Call }) {
  const [s, setS] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    call<Stats>('/api/admin/stats').then(setS, (e: ApiError) => setError(e.message));
  }, [call]);
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!s) return <Spinner />;
  const tiles = [
    { label: 'Jobs today', value: s.jobsToday },
    { label: 'Upcoming bookings', value: s.upcoming },
    { label: 'Booked value this month', value: formatMoney(s.revenueMonth) },
    { label: 'Active cleaners', value: s.activeCleaners },
    { label: 'Customers', value: s.customers },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">{formatDateLong(s.today)}</h1>
      {s.activeCleaners === 0 && (
        <Alert tone="warn" title="No active cleaners">
          Customers cannot book until you add at least one cleaner in the Cleaners tab.
        </Alert>
      )}
      <ul className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {tiles.map((t) => (
          <li key={t.label}>
            <Card className="p-5">
              <p className="text-muted">{t.label}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{t.value}</p>
            </Card>
          </li>
        ))}
      </ul>
      <Card>
        <h2 className="p-5 text-xl font-semibold border-b border-line">Recent activity</h2>
        {s.recent.length === 0 ? (
          <p className="p-5 text-muted">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {s.recent.map((r, i) => (
              <li key={i} className="px-5 py-3 flex flex-col sm:flex-row sm:gap-4">
                <span className="text-muted tabular-nums w-44 shrink-0">{r.at} UTC</span>
                <span className="font-semibold w-48 shrink-0">{r.action}</span>
                <span className="text-muted break-all">{r.details}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// ---------- Bookings ----------

function Bookings({ call }: { call: Call }) {
  const [rows, setRows] = useState<BookingView[] | null>(null);
  const [cleaners, setCleaners] = useState<{ id: number; name: string }[]>([]);
  const [filter, setFilter] = useState({ range: 'upcoming', status: '', q: '' });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [open, setOpen] = useState<BookingView | null>(null);

  const load = useCallback(() => {
    const p = new URLSearchParams();
    const today = nowInBusinessTz().date;
    if (filter.range === 'upcoming') p.set('from', today);
    if (filter.range === 'today') {
      p.set('from', today);
      p.set('to', today);
    }
    if (filter.range === 'week') {
      p.set('from', today);
      p.set('to', addDays(today, 7));
    }
    if (filter.status) p.set('status', filter.status);
    if (filter.q.trim()) p.set('q', filter.q.trim());
    call<{ bookings: BookingView[]; cleaners: { id: number; name: string }[] }>(`/api/admin/bookings?${p}`).then(
      (r) => {
        setRows(r.bookings);
        setCleaners(r.cleaners);
      },
      (e: ApiError) => setError(e.message),
    );
  }, [call, filter]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  async function patch(ref: string, body: Record<string, unknown>, msg: string) {
    setError(null);
    try {
      await call(`/api/admin/bookings/${ref}`, { method: 'PATCH', body });
      setNotice(msg);
      setOpen(null);
      load();
    } catch (e) {
      setError((e as ApiError).message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <h1 className="text-3xl font-semibold">Bookings</h1>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" aria-hidden />
            <input
              aria-label="Search bookings"
              placeholder="Ref, name, email, postcode"
              value={filter.q}
              onChange={(e) => setFilter({ ...filter, q: e.target.value })}
              className={cx(selectClass, 'pl-9 w-64')}
              maxLength={60}
            />
          </div>
          <select aria-label="Date range" className={selectClass} value={filter.range} onChange={(e) => setFilter({ ...filter, range: e.target.value })}>
            <option value="today">Today</option>
            <option value="week">Next 7 days</option>
            <option value="upcoming">All upcoming</option>
            <option value="all">All dates</option>
          </select>
          <select aria-label="Status" className={selectClass} value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
            <option value="">Any status</option>
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}
      {!rows ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center text-muted">No bookings match.</Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-soft text-muted text-[0.9rem]">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Cleaner</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((b) => (
                <tr key={b.ref} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold">{b.date}</p>
                    <p className="text-muted">{formatTimeRange(b.startMin, b.durationMin)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{b.customer?.name}</p>
                    <p className="text-muted">{b.postcode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{b.serviceTitle}</p>
                    <p className="text-muted">{b.ref}</p>
                  </td>
                  <td className="px-4 py-3">{b.cleaner?.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatMoney(b.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="secondary" onClick={() => setOpen(b)}>
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <BookingModal key={open?.ref} booking={open} cleaners={cleaners} onClose={() => setOpen(null)} onPatch={patch} error={error} />
    </div>
  );
}

function BookingModal({
  booking: b,
  cleaners,
  onClose,
  onPatch,
  error,
}: {
  booking: BookingView | null;
  cleaners: { id: number; name: string }[];
  onClose: () => void;
  onPatch: (ref: string, body: Record<string, unknown>, msg: string) => void;
  error: string | null;
}) {
  const [cleanerId, setCleanerId] = useState(String(b?.cleaner?.id ?? ''));
  const [status, setStatus] = useState<BookingStatus>(b?.status ?? 'confirmed');
  return (
    <Modal open={!!b} onClose={onClose} title={b ? `Booking ${b.ref}` : ''} wide>
      {b && (
        <div className="space-y-5">
          {error && <Alert tone="error">{error}</Alert>}
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
            <Info label="When" value={`${formatDateLong(b.date)}, ${formatTimeRange(b.startMin, b.durationMin)}`} />
            <Info label="Service" value={b.serviceTitle} />
            <Info label="Customer" value={`${b.customer?.name} · ${b.customer?.phone}`} />
            <Info label="Email" value={b.customer?.email ?? ''} />
            <Info label="Address" value={`${b.street}, ${b.city}, ${b.postcode}`} />
            <Info label="Access" value={b.accessNotes || b.accessMethod} />
            <Info label="Rooms" value={`${b.rooms.bedrooms} bed · ${b.rooms.bathrooms} bath · ${b.rooms.kitchens} kitchen · ${b.rooms.livingRooms} living · ${b.rooms.extraAreas} other`} />
            <Info label="Extras" value={b.addons.map((a) => a.name).join(', ') || 'None'} />
            {b.notes && <Info label="Notes" value={b.notes} />}
            <Info label="Price" value={`${formatMoney(b.total)} (discount ${formatMoney(b.discount)})`} />
          </dl>
          <div className="grid sm:grid-cols-2 gap-4 border-t border-line pt-5">
            <div>
              <label className="block font-semibold mb-1.5" htmlFor="cleaner-select">
                Cleaner
              </label>
              <div className="flex gap-2">
                <select id="cleaner-select" className={cx(selectClass, 'flex-1')} value={cleanerId} onChange={(e) => setCleanerId(e.target.value)}>
                  {!cleaners.some((c) => String(c.id) === cleanerId) && <option value={cleanerId}>{b.cleaner?.name} (inactive)</option>}
                  {cleaners.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Button size="sm" variant="secondary" disabled={cleanerId === String(b.cleaner?.id)} onClick={() => onPatch(b.ref, { cleanerId: Number(cleanerId) }, `${b.ref}: cleaner changed.`)}>
                  Save
                </Button>
              </div>
              <p className="mt-1.5 text-[0.9rem] text-muted">Blocked automatically if they are busy at that time.</p>
            </div>
            <div>
              <label className="block font-semibold mb-1.5" htmlFor="status-select">
                Status
              </label>
              <div className="flex gap-2">
                <select id="status-select" className={cx(selectClass, 'flex-1')} value={status} onChange={(e) => setStatus(e.target.value as BookingStatus)}>
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <Button size="sm" variant="secondary" disabled={status === b.status} onClick={() => onPatch(b.ref, { status }, `${b.ref}: status set to ${STATUS_LABEL[status]}.`)}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted text-[0.9rem]">{label}</dt>
      <dd className="font-medium break-words">{value}</dd>
    </div>
  );
}

// ---------- Cleaners ----------

interface CleanerRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  active: number;
  upcoming: number;
  completed: number;
}

function Cleaners({ call }: { call: Call }) {
  const [rows, setRows] = useState<CleanerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [resetFor, setResetFor] = useState<CleanerRow | null>(null);

  const load = useCallback(() => {
    call<{ cleaners: CleanerRow[] }>('/api/admin/cleaners').then((r) => setRows(r.cleaners), (e: ApiError) => setError(e.message));
  }, [call]);
  useEffect(load, [load]);

  async function toggle(c: CleanerRow) {
    setError(null);
    try {
      await call(`/api/admin/cleaners/${c.id}`, { method: 'PATCH', body: { active: !c.active } });
      setNotice(`${c.name} is now ${c.active ? 'inactive' : 'active'}.`);
      load();
    } catch (e) {
      setError((e as ApiError).message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Cleaners</h1>
        <Button onClick={() => setAdding(true)}>
          <UserPlus className="size-5" aria-hidden /> Add cleaner
        </Button>
      </div>
      <p className="text-muted">The number of active cleaners decides how many bookings can happen at the same time.</p>
      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}
      {!rows ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center text-muted">No cleaners yet. Add your first cleaner to start taking bookings.</Card>
      ) : (
        <Card className="divide-y divide-line">
          {rows.map((c) => (
            <div key={c.id} className="flex flex-col md:flex-row md:items-center gap-3 p-5">
              <div className="flex-1">
                <p className="font-semibold text-lg">
                  {c.name} {!c.active && <span className="ml-2 rounded-full bg-sand px-2.5 py-0.5 text-sm text-muted">Inactive</span>}
                </p>
                <p className="text-muted">
                  {c.email} · {c.phone}
                </p>
              </div>
              <p className="text-muted md:w-56">
                {c.upcoming} upcoming · {c.completed} done
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setResetFor(c)}>
                  Reset password
                </Button>
                <Button size="sm" variant={c.active ? 'danger' : 'secondary'} onClick={() => toggle(c)}>
                  {c.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}
      <AddCleaner
        key={`add-${adding}`}
        open={adding}
        call={call}
        onClose={() => setAdding(false)}
        onDone={(n) => {
          setAdding(false);
          setNotice(`${n} added. Share their email and password with them so they can log in at /cleaner/login.`);
          load();
        }}
      />
      <ResetPassword
        key={`reset-${resetFor?.id}`}
        cleaner={resetFor}
        call={call}
        onClose={() => setResetFor(null)}
        onDone={(n) => {
          setResetFor(null);
          setNotice(`Password changed for ${n}. They have been logged out everywhere.`);
        }}
      />
    </div>
  );
}

function AddCleaner({ open, call, onClose, onDone }: { open: boolean; call: Call; onClose: () => void; onDone: (name: string) => void }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await call('/api/admin/cleaners', { body: f });
      onDone(f.name);
    } catch (err) {
      const ae = err as ApiError;
      setErrors({ [ae.field ?? '_']: ae.message });
    } finally {
      setBusy(false);
    }
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal open={open} onClose={onClose} title="Add a cleaner">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {errors._ && <Alert tone="error">{errors._}</Alert>}
        <TextField label="Full name" value={f.name} onChange={set('name')} error={errors.name} maxLength={80} />
        <TextField label="Email" type="email" value={f.email} onChange={set('email')} error={errors.email} maxLength={254} />
        <TextField label="Phone" type="tel" value={f.phone} onChange={set('phone')} error={errors.phone} maxLength={25} />
        <TextField label="Temporary password" hint="At least 8 characters." type="password" autoComplete="new-password" value={f.password} onChange={set('password')} error={errors.password} />
        <Button type="submit" loading={busy} className="w-full">
          Add cleaner
        </Button>
      </form>
    </Modal>
  );
}

function ResetPassword({ cleaner, call, onClose, onDone }: { cleaner: CleanerRow | null; call: Call; onClose: () => void; onDone: (name: string) => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!cleaner) return;
    setBusy(true);
    try {
      await call(`/api/admin/cleaners/${cleaner.id}`, { method: 'PATCH', body: { password: pw } });
      onDone(cleaner.name);
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal open={!!cleaner} onClose={onClose} title={`New password for ${cleaner?.name ?? ''}`}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField label="New password" hint="At least 8 characters." type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} error={error ?? undefined} />
        <Button type="submit" loading={busy} className="w-full">
          Save password
        </Button>
      </form>
    </Modal>
  );
}

// ---------- Prices ----------

function Prices({ call }: { call: Call }) {
  const [cat, setCat] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const load = useCallback(() => {
    call<Catalog>('/api/admin/catalog').then(setCat, (e: ApiError) => setError(e.message));
  }, [call]);
  useEffect(load, [load]);

  async function save(url: string, body: Record<string, unknown>, label: string) {
    setError(null);
    setNotice(null);
    try {
      await call(url, { method: 'PATCH', body });
      setNotice(`${label} saved. New bookings use the new price straight away.`);
      load();
    } catch (e) {
      setError((e as ApiError).message);
    }
  }

  if (!cat) return error ? <Alert tone="error">{error}</Alert> : <Spinner />;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Prices</h1>
      <p className="text-muted">Existing bookings keep the price the customer agreed to.</p>
      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}
      <Card className="divide-y divide-line">
        <h2 className="p-5 text-xl font-semibold">Services</h2>
        {cat.services.map((s) => (
          <PriceRow
            key={s.id}
            title={s.title}
            fields={[
              { key: 'hourlyRate', label: '£ / hour', value: s.hourlyRate, step: 0.5 },
              { key: 'minHours', label: 'Min hours', value: s.minHours, step: 0.5 },
            ]}
            active={s.active}
            onSave={(v, active) => save(`/api/admin/services/${s.id}`, { ...v, active }, s.title)}
          />
        ))}
      </Card>
      <Card className="divide-y divide-line">
        <h2 className="p-5 text-xl font-semibold">Extras</h2>
        {cat.addons.map((a) => (
          <PriceRow
            key={a.id}
            title={a.name}
            fields={[
              { key: 'price', label: 'Price £', value: a.price, step: 0.5 },
              { key: 'durationMin', label: 'Minutes', value: a.durationMin, step: 5, int: true },
            ]}
            active={a.active}
            onSave={(v, active) => save(`/api/admin/addons/${a.id}`, { ...v, active }, a.name)}
          />
        ))}
      </Card>
    </div>
  );
}

function PriceRow({
  title,
  fields,
  active,
  onSave,
}: {
  title: string;
  fields: { key: string; label: string; value: number; step: number; int?: boolean }[];
  active: boolean;
  onSave: (values: Record<string, number>, active: boolean) => void;
}) {
  const [vals, setVals] = useState(() => Object.fromEntries(fields.map((f) => [f.key, String(f.value)])));
  const [on, setOn] = useState(active);
  const dirty = on !== active || fields.some((f) => Number(vals[f.key]) !== f.value);
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-3 p-5">
      <p className="flex-1 font-semibold text-lg md:pb-2.5">{title}</p>
      {fields.map((f) => (
        <label key={f.key} className="block">
          <span className="block text-[0.9rem] text-muted mb-1">{f.label}</span>
          <input
            type="number"
            inputMode="decimal"
            step={f.step}
            min={0}
            value={vals[f.key]}
            onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
            className={cx(selectClass, 'w-32 tabular-nums')}
          />
        </label>
      ))}
      <label className="flex items-center gap-2 md:pb-2.5 font-medium">
        <input type="checkbox" checked={on} onChange={(e) => setOn(e.target.checked)} className="size-5 accent-[var(--color-brand-strong)]" /> Available
      </label>
      <Button
        size="sm"
        disabled={!dirty}
        onClick={() => onSave(Object.fromEntries(fields.map((f) => [f.key, f.int ? Math.round(Number(vals[f.key])) : Number(vals[f.key])])), on)}
      >
        Save
      </Button>
    </div>
  );
}

// ---------- Customers ----------

function Customers({ call }: { call: Call }) {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<{ id: number; name: string; email: string; phone: string; createdAt: string; bookings: number; spent: number }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      call<{ customers: NonNullable<typeof rows> }>(`/api/admin/customers?q=${encodeURIComponent(q)}`).then((r) => setRows(r.customers), (e: ApiError) => setError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [call, q]);
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <h1 className="text-3xl font-semibold">Customers</h1>
        <input aria-label="Search customers" placeholder="Search name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} className={cx(selectClass, 'w-72')} maxLength={60} />
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {!rows ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <Card className="p-8 text-center text-muted">No customers found.</Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-soft text-muted text-[0.9rem]">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold text-right">Bookings</th>
                <th className="px-4 py-3 font-semibold text-right">Completed spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3">
                    <p>{c.email}</p>
                    <p className="text-muted">{c.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.createdAt.slice(0, 10)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.bookings}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{formatMoney(c.spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
