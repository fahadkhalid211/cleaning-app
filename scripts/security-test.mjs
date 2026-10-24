// Security + booking-integrity tests against a running server.
// Usage: node --env-file=.env.local scripts/security-test.mjs   (BASE_URL defaults to http://localhost:3000)
// Needs ADMIN_EMAIL / ADMIN_PASSWORD for an existing admin. Creates throwaway test data.
// Run it against a local or staging copy, never against your live database.

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const results = [];
let ipCounter = 1;

class Client {
  constructor() {
    this.cookie = '';
    this.ip = `10.0.${Math.floor(ipCounter / 250)}.${ipCounter++ % 250}`;
  }
  async req(path, { method, body, headers = {}, raw } = {}) {
    const res = await fetch(BASE + path, {
      method: method || (body !== undefined ? 'POST' : 'GET'),
      headers: {
        'x-forwarded-for': this.ip,
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
        ...(this.cookie ? { cookie: this.cookie } : {}),
        ...headers,
      },
      body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
      redirect: 'manual',
    });
    const set = res.headers.get('set-cookie');
    if (set) {
      const m = set.match(/ps_session=([^;]*)/);
      if (m) this.cookie = m[1] ? `ps_session=${m[1]}` : '';
    }
    let data = null;
    try {
      data = await res.json();
    } catch {}
    return { status: res.status, data, headers: res.headers };
  }
}

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

const uid = () => Math.random().toString(36).slice(2, 8);
const dayOfWeek = (d) => new Date(`${d}T12:00:00Z`).getUTCDay();
const addDays = (d, n) => {
  const x = new Date(`${d}T12:00:00Z`);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};

async function register(c, extra = {}) {
  const email = `qa-${uid()}@test.test`;
  const r = await c.req('/api/auth/register', { body: { name: 'QA Tester', email, phone: '07700 900123', password: 'correct-horse-9', ...extra } });
  return { ...r, email };
}

const job = (date, startMin, extra = {}) => ({
  serviceId: 'regular',
  rooms: { bedrooms: 1, bathrooms: 1, kitchens: 1, livingRooms: 1, extraAreas: 0 },
  addonIds: [],
  frequency: 'one_off',
  date,
  startMin,
  street: '1 Test Street',
  city: 'London',
  postcode: 'SW1A 1AA',
  accessMethod: 'home',
  accessNotes: '',
  hasPets: false,
  notes: '',
  ...extra,
});

async function main() {
  console.log(`Testing ${BASE}\n`);
  const anon = new Client();

  // ---------- Headers ----------
  const home = await fetch(BASE + '/');
  check('Security headers: CSP present', !!home.headers.get('content-security-policy'));
  check('Security headers: clickjacking blocked', home.headers.get('x-frame-options') === 'DENY');
  check('Security headers: no X-Powered-By', !home.headers.get('x-powered-by'));

  // ---------- Setup ----------
  const admin = new Client();
  const al = await admin.req('/api/auth/login', { body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, portal: 'admin' } });
  if (al.status !== 200) throw new Error(`Admin login failed (${al.status}). Set ADMIN_EMAIL / ADMIN_PASSWORD.`);
  // Add 2 dedicated cleaners so capacity is predictable.
  const before = (await admin.req('/api/admin/cleaners')).data.cleaners;
  for (const c of before.filter((c) => c.active && c.upcoming === 0)) await admin.req(`/api/admin/cleaners/${c.id}`, { method: 'PATCH', body: { active: false } });
  const busyActive = before.filter((c) => c.active && c.upcoming > 0).length;
  const cleanerEmails = [];
  for (let i = 0; i < 2; i++) {
    const email = `qa-cleaner-${uid()}@test.test`;
    await admin.req('/api/admin/cleaners', { body: { name: `QA Cleaner ${i + 1}`, email, phone: '07700 900999', password: 'cleaner-pass-1' } });
    cleanerEmails.push(email);
  }
  const capacity = 2 + busyActive;

  const cat = (await anon.req('/api/catalog')).data;
  // Pick a quiet working day far in the future for each scenario.
  let d = addDays(cat.bookable.last, -1);
  const nextWorkday = () => {
    do d = addDays(d, -1);
    while (dayOfWeek(d) === 0);
    return d;
  };

  // ---------- Access control ----------
  for (const [path, label] of [
    ['/api/admin/stats', 'admin stats'],
    ['/api/admin/bookings', 'admin bookings'],
    ['/api/admin/customers', 'customer list'],
    ['/api/cleaner/jobs', 'cleaner jobs'],
    ['/api/bookings', 'my bookings'],
  ]) {
    const r = await anon.req(path);
    check(`Logged-out visitor blocked from ${label}`, r.status === 401, `status ${r.status}`);
  }

  const alice = new Client();
  const ra = await register(alice, { role: 'admin' });
  check('Register: extra "role: admin" field is ignored', ra.status === 200);
  const esc = await new Client().req('/api/auth/login', { body: { email: ra.email, password: 'correct-horse-9', portal: 'admin' } });
  check('Customer cannot log in to the admin area', esc.status === 401, `status ${esc.status}`);
  const escC = await new Client().req('/api/auth/login', { body: { email: ra.email, password: 'correct-horse-9', portal: 'cleaner' } });
  check('Customer cannot log in to the cleaner area', escC.status === 401);
  check('Customer blocked from admin API', (await alice.req('/api/admin/customers')).status === 403);
  check('Customer blocked from cleaner API', (await alice.req('/api/cleaner/jobs')).status === 403);
  check('Customer cannot change prices', (await alice.req('/api/admin/services/regular', { method: 'PATCH', body: { hourlyRate: 1, minHours: 1 } })).status === 403);

  const forged = new Client();
  forged.cookie = 'ps_session=' + 'A'.repeat(43);
  check('Forged session cookie rejected', (await forged.req('/api/bookings')).status === 401);

  // ---------- Input / tampering ----------
  const day1 = nextWorkday();
  const tamper = await alice.req('/api/bookings', { body: { ...job(day1, 9 * 60), total: 0.01, hourlyRate: 1, subtotal: 0, discount: 999 } });
  const real = cat.services.find((s) => s.id === 'regular');
  const expected = Math.max(real.minHours, Math.ceil((0.6 + 0.7 + 0.8 + 0.5) * 2) / 2) * real.hourlyRate;
  const mine = (await alice.req('/api/bookings')).data.bookings.find((b) => b.ref === tamper.data?.ref);
  check('Price tampering ignored (server recalculates)', mine && mine.total === expected, `charged ${mine?.total}, expected ${expected}`);

  const bad = [
    ['negative rooms', job(day1, 11 * 60, { rooms: { bedrooms: -5, bathrooms: 1, kitchens: 1, livingRooms: 1, extraAreas: 0 } })],
    ['1000 bedrooms', job(day1, 11 * 60, { rooms: { bedrooms: 1000, bathrooms: 1, kitchens: 1, livingRooms: 1, extraAreas: 0 } })],
    ['date in the past', job('2020-01-01', 9 * 60)],
    ['impossible date', job('2026-02-31', 9 * 60)],
    ['3am start', job(day1, 3 * 60)],
    ['start at 17:30 (would finish after closing)', job(day1, 17 * 60 + 30)],
    ['unknown service', job(day1, 11 * 60, { serviceId: 'free_clean' })],
    ['unknown extra', job(day1, 11 * 60, { addonIds: ['gold_plating'] })],
    ['object instead of text', job(day1, 11 * 60, { street: { $gt: '' } })],
  ];
  const sunday = (() => {
    let x = cat.bookable.first;
    while (dayOfWeek(x) !== 0) x = addDays(x, 1);
    return x;
  })();
  bad.push(['Sunday (closed)', job(sunday, 9 * 60)]);
  for (const [label, body] of bad) {
    const r = await alice.req('/api/bookings', { body });
    check(`Rejects ${label}`, r.status === 400, `status ${r.status}: ${r.data?.error}`);
  }

  const dupDay = nextWorkday();
  const dup = await alice.req('/api/bookings', { body: job(dupDay, 9 * 60, { addonIds: ['oven', 'oven', 'oven'] }) });
  const dupB = (await alice.req(`/api/bookings/${dup.data?.ref}`)).data?.booking;
  check('Repeated extras are counted once (no time/price stacking)', dup.status === 201 && dupB?.addons.length === 1, `${dupB?.addons.length} extras charged`);
  await alice.req(`/api/bookings/${dup.data?.ref}`, { method: 'PATCH', body: { action: 'cancel' } });

  const big = await alice.req('/api/bookings', { raw: JSON.stringify({ notes: 'x'.repeat(100_000) }), headers: { 'content-type': 'application/json' }, method: 'POST' });
  check('Oversized request rejected', big.status === 413);
  const notJson = await alice.req('/api/bookings', { raw: '{"broken', headers: { 'content-type': 'application/json' }, method: 'POST' });
  check('Malformed JSON rejected cleanly', notJson.status === 400 && !JSON.stringify(notJson.data).includes('at '));

  const xss = '<img src=x onerror=alert(1)>';
  const sqli = "Robert'); DROP TABLE bookings;--";
  const inj = await alice.req('/api/bookings', { body: job(nextWorkday(), 9 * 60, { notes: xss, street: sqli }) });
  const stored = (await admin.req(`/api/admin/bookings?q=${encodeURIComponent(inj.data?.ref ?? 'none')}`)).data.bookings[0];
  check('SQL injection stored as plain text, tables intact', inj.status === 201 && stored?.street === sqli);
  check('XSS payload stored as plain text (React escapes on display)', stored?.notes === xss);
  const searchInj = await admin.req(`/api/admin/bookings?q=${encodeURIComponent("' OR 1=1 --")}`);
  check('SQL injection in admin search returns nothing', searchInj.status === 200 && searchInj.data.bookings.length === 0);

  // ---------- IDOR ----------
  const bob = new Client();
  await register(bob);
  const aliceRef = tamper.data.ref;
  check("Customer can't read someone else's booking", (await bob.req(`/api/bookings/${aliceRef}`)).status === 404);
  check("Customer can't cancel someone else's booking", (await bob.req(`/api/bookings/${aliceRef}`, { method: 'PATCH', body: { action: 'cancel' } })).status === 404);
  check("Customer can't see someone else's booking via availability", (await bob.req('/api/availability', { body: { date: day1, ref: aliceRef } })).status === 404);
  check('Customer list shows only own bookings', (await bob.req('/api/bookings')).data.bookings.length === 0);

  // ---------- CSRF ----------
  const csrf = await alice.req(`/api/bookings/${aliceRef}`, { method: 'PATCH', body: { action: 'cancel' }, headers: { origin: 'https://evil.example' } });
  check('Cross-site request (CSRF) blocked', csrf.status === 403);

  // ---------- Brute force ----------
  const victim = new Client();
  const v = await register(victim);
  let last;
  for (let i = 0; i < 8; i++) last = await new Client().req('/api/auth/login', { body: { email: v.email, password: `guess-${i}`, portal: 'customer' } });
  check('Password guessing is rate-limited (even from many IPs)', last.status === 429, `status ${last.status}`);
  const unknown = await new Client().req('/api/auth/login', { body: { email: `nobody-${uid()}@test.test`, password: 'x', portal: 'customer' } });
  const wrong = await new Client().req('/api/auth/login', { body: { email: ra.email, password: 'wrong-password', portal: 'customer' } });
  check('Same error for unknown email and wrong password', unknown.data?.error === wrong.data?.error);

  // ---------- Double booking ----------
  const raceDay = nextWorkday();
  const racers = Array.from({ length: 10 }, () => new Client());
  const raceResults = await Promise.all(
    racers.map((c, i) =>
      c.req('/api/bookings', {
        body: { ...job(raceDay, 10 * 60), account: { name: `Racer ${i}`, email: `race-${uid()}@test.test`, phone: '07700 900111', password: 'race-pass-123' } },
      }),
    ),
  );
  const won = raceResults.filter((r) => r.status === 201).length;
  const lost = raceResults.filter((r) => r.status === 409).length;
  check(`10 customers grab the same slot at once → only ${capacity} succeed`, won === capacity && lost === 10 - capacity, `${won} booked, ${lost} told "taken"`);

  const day = (await admin.req(`/api/admin/bookings?from=${raceDay}&to=${raceDay}`)).data.bookings.filter((b) => b.status !== 'cancelled');
  let overlap = false;
  for (const a of day) for (const b of day) if (a !== b && a.cleaner.id === b.cleaner.id && a.startMin < b.startMin + b.durationMin + 30 && b.startMin < a.startMin + a.durationMin + 30) overlap = true;
  check('No cleaner has overlapping jobs (incl. 30 min travel gap)', !overlap);

  const slots = (await anon.req('/api/availability', { body: job(raceDay, 0) })).data.slots;
  const blocked = slots.filter((s) => s.startMin >= 8 * 60 && s.startMin < 13 * 60 && !s.available).length;
  check('Overlapping start times now show as full', slots.find((s) => s.startMin === 10 * 60)?.available === false && blocked >= 3, `${blocked} blocked`);

  const carol = new Client();
  await register(carol);
  const key = `key-${uid()}-${uid()}`;
  const dd = nextWorkday();
  const k1 = await carol.req('/api/bookings', { body: { ...job(dd, 9 * 60), requestKey: key } });
  const k2 = await carol.req('/api/bookings', { body: { ...job(dd, 9 * 60), requestKey: key } });
  check('Double-click / retry creates only one booking', k1.status === 201 && k2.data?.ref === k1.data?.ref);
  const k3 = await carol.req('/api/bookings', { body: job(dd, 10 * 60) });
  check('Same customer cannot book two overlapping cleans', k3.status === 409, `status ${k3.status}`);

  // Reschedule into a full slot
  const dave = new Client();
  await register(dave);
  const dDay = nextWorkday();
  const own = await dave.req('/api/bookings', { body: job(dDay, 15 * 60) });
  const intoFull = await dave.req(`/api/bookings/${own.data.ref}`, { method: 'PATCH', body: { action: 'reschedule', date: raceDay, startMin: 10 * 60 } });
  check('Reschedule into a fully booked time is refused', intoFull.status === 409);
  const ok = await dave.req(`/api/bookings/${own.data.ref}`, { method: 'PATCH', body: { action: 'reschedule', date: dDay, startMin: 8 * 60 } });
  check('Reschedule into a free time works', ok.status === 200, ok.data?.error);

  // Admin reassignment into a clash
  const raceBookings = day.filter((b) => b.startMin === 10 * 60);
  if (raceBookings.length >= 2) {
    const [a, b] = raceBookings;
    const clash = await admin.req(`/api/admin/bookings/${a.ref}`, { method: 'PATCH', body: { cleanerId: b.cleaner.id } });
    check('Admin cannot assign a cleaner who is already busy', clash.status === 409);
  }

  // Cleaner restrictions
  const cl = new Client();
  await cl.req('/api/auth/login', { body: { email: cleanerEmails[0], password: 'cleaner-pass-1', portal: 'cleaner' } });
  const jobs = (await cl.req('/api/cleaner/jobs')).data.jobs;
  const foreign = day.find((b) => !jobs.some((j) => j.ref === b.ref));
  if (foreign) check("Cleaner can't update another cleaner's job", (await cl.req(`/api/cleaner/jobs/${foreign.ref}`, { method: 'PATCH', body: { status: 'on_the_way' } })).status === 404);
  if (jobs[0]) check('Cleaner cannot mark a future job as done', (await cl.req(`/api/cleaner/jobs/${jobs[0].ref}`, { method: 'PATCH', body: { status: 'completed' } })).status === 409);
  check("Cleaner can't see customers' email addresses", jobs.every((j) => !j.customer?.email));

  // Logout really ends the session
  const stolen = alice.cookie;
  await alice.req('/api/auth/logout', { method: 'POST' });
  const replay = new Client();
  replay.cookie = stolen;
  check('Session is dead after logout (stolen cookie useless)', (await replay.req('/api/bookings')).status === 401);

  // Cleanup: deactivate test cleaners after cancelling their jobs, restore earlier cleaners.
  for (const b of (await admin.req('/api/admin/bookings?status=confirmed')).data.bookings.filter((b) => b.cleaner.name.startsWith('QA Cleaner'))) {
    await admin.req(`/api/admin/bookings/${b.ref}`, { method: 'PATCH', body: { status: 'cancelled' } });
  }
  const after = (await admin.req('/api/admin/cleaners')).data.cleaners;
  for (const c of after) {
    if (c.name.startsWith('QA Cleaner')) await admin.req(`/api/admin/cleaners/${c.id}`, { method: 'PATCH', body: { active: false } });
    else if (before.find((b) => b.id === c.id)?.active) await admin.req(`/api/admin/cleaners/${c.id}`, { method: 'PATCH', body: { active: true } });
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
