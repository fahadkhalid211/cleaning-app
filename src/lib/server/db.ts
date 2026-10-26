import 'server-only';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ADDON_SEED, SERVICE_SEED } from '@/lib/catalog-seed';
import { hashPassword } from './passwords';

// One SQLite file. In production it lives OUTSIDE the deployed folder by default,
// so a fresh GitHub deploy never wipes customer bookings.
function resolveDbPath(): string {
  if (process.env.DATABASE_PATH) return path.resolve(process.env.DATABASE_PATH);
  if (process.env.NODE_ENV === 'production') return path.join(os.homedir(), 'hoodie-data', 'hoodie.db');
  return path.join(process.cwd(), 'data', 'hoodie.db');
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('customer','cleaner','admin')),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone         TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS services (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  short           TEXT NOT NULL,
  description     TEXT NOT NULL,
  hourly_rate     REAL NOT NULL CHECK (hourly_rate > 0),
  min_hours       REAL NOT NULL CHECK (min_hours > 0),
  time_multiplier REAL NOT NULL DEFAULT 1,
  icon            TEXT NOT NULL DEFAULT 'Sparkles',
  includes_json   TEXT NOT NULL DEFAULT '[]',
  sort            INTEGER NOT NULL DEFAULT 0,
  active          INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS addons (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL,
  price        REAL NOT NULL CHECK (price >= 0),
  duration_min INTEGER NOT NULL CHECK (duration_min >= 0),
  sort         INTEGER NOT NULL DEFAULT 0,
  active       INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bookings (
  id            INTEGER PRIMARY KEY,
  ref           TEXT NOT NULL UNIQUE,
  customer_id   INTEGER NOT NULL REFERENCES users(id),
  cleaner_id    INTEGER NOT NULL REFERENCES users(id),
  service_id    TEXT NOT NULL,
  service_title TEXT NOT NULL,
  frequency     TEXT NOT NULL,
  rooms_json    TEXT NOT NULL,
  addons_json   TEXT NOT NULL,
  date          TEXT NOT NULL,
  start_min     INTEGER NOT NULL,
  duration_min  INTEGER NOT NULL CHECK (duration_min > 0),
  status        TEXT NOT NULL CHECK (status IN ('confirmed','on_the_way','in_progress','completed','cancelled')),
  street        TEXT NOT NULL,
  city          TEXT NOT NULL,
  postcode      TEXT NOT NULL,
  access_method TEXT NOT NULL,
  access_notes  TEXT NOT NULL DEFAULT '',
  has_pets      INTEGER NOT NULL DEFAULT 0,
  notes         TEXT NOT NULL DEFAULT '',
  subtotal      REAL NOT NULL,
  discount      REAL NOT NULL,
  total         REAL NOT NULL,
  request_key   TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_bookings_date ON bookings(date, status);
CREATE INDEX IF NOT EXISTS ix_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS ix_bookings_cleaner ON bookings(cleaner_id, date);
-- Last line of defence against double booking, on top of the overlap check in scheduling.ts.
CREATE UNIQUE INDEX IF NOT EXISTS ux_cleaner_start ON bookings(cleaner_id, date, start_min) WHERE status <> 'cancelled';
CREATE UNIQUE INDEX IF NOT EXISTS ux_customer_start ON bookings(customer_id, date, start_min) WHERE status <> 'cancelled';
CREATE UNIQUE INDEX IF NOT EXISTS ux_request_key ON bookings(customer_id, request_key) WHERE request_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS audit_log (
  id       INTEGER PRIMARY KEY,
  at       TEXT NOT NULL DEFAULT (datetime('now')),
  actor_id INTEGER,
  action   TEXT NOT NULL,
  details  TEXT NOT NULL DEFAULT ''
);
`;

function seed(db: DatabaseSync) {
  const serviceCount = db.prepare('SELECT COUNT(*) AS n FROM services').get() as { n: number };
  if (serviceCount.n === 0) {
    const ins = db.prepare(
      `INSERT INTO services (id, title, short, description, hourly_rate, min_hours, time_multiplier, icon, includes_json, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    SERVICE_SEED.forEach((s, i) =>
      ins.run(s.id, s.title, s.short, s.description, s.hourlyRate, s.minHours, s.timeMultiplier, s.icon, JSON.stringify(s.includes), i),
    );
  }

  const addonCount = db.prepare('SELECT COUNT(*) AS n FROM addons').get() as { n: number };
  if (addonCount.n === 0) {
    const ins = db.prepare('INSERT INTO addons (id, name, description, price, duration_min, sort) VALUES (?, ?, ?, ?, ?, ?)');
    ADDON_SEED.forEach((a, i) => ins.run(a.id, a.name, a.description, a.price, a.durationMin, i));
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD && ADMIN_PASSWORD.length >= 8) {
    const cleanEmail = ADMIN_EMAIL.trim().toLowerCase();
    const existing = db.prepare('SELECT id, role FROM users WHERE email = ?').get(cleanEmail) as { id: number; role: string } | undefined;
    if (existing) {
      db.prepare("UPDATE users SET role = 'admin', name = ?, password_hash = ?, active = 1 WHERE id = ?").run(
        ADMIN_NAME || 'Hoodie',
        hashPassword(ADMIN_PASSWORD),
        existing.id,
      );
      console.log(`[db] Synced admin account for ${cleanEmail}`);
    } else {
      const anyAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get() as { id: number } | undefined;
      if (anyAdmin) {
        db.prepare("UPDATE users SET name = ?, email = ?, password_hash = ?, active = 1 WHERE id = ?").run(
          ADMIN_NAME || 'Hoodie',
          cleanEmail,
          hashPassword(ADMIN_PASSWORD),
          anyAdmin.id,
        );
        console.log(`[db] Updated admin account to ${cleanEmail}`);
      } else {
        db.prepare("INSERT INTO users (role, name, email, password_hash) VALUES ('admin', ?, ?, ?)").run(
          ADMIN_NAME || 'Hoodie',
          cleanEmail,
          hashPassword(ADMIN_PASSWORD),
        );
        console.log(`[db] Created admin account for ${cleanEmail}`);
      }
    }
  } else if (!db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get()) {
    console.warn('[db] No admin account yet. Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters) and restart.');
  }

  // Optional demo cleaners so a fresh install can take bookings straight away.
  const cleanerCount = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'cleaner'").get() as { n: number };
  const demoPassword = process.env.DEMO_CLEANER_PASSWORD;
  if (cleanerCount.n === 0 && process.env.SEED_DEMO_CLEANERS === 'true' && demoPassword && demoPassword.length >= 8) {
    const ins = db.prepare("INSERT INTO users (role, name, email, phone, password_hash) VALUES ('cleaner', ?, ?, ?, ?)");
    const hash = hashPassword(demoPassword);
    ins.run('Maria Santos', 'maria@cleaners.test', '07700 900001', hash);
    ins.run('James Okafor', 'james@cleaners.test', '07700 900002', hash);
    console.log('[db] Seeded 2 demo cleaners');
  }
}

function open(): DatabaseSync {
  const file = resolveDbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA synchronous = NORMAL;');
  db.exec(SCHEMA);
  seed(db);
  console.log(`[db] Using ${file}`);
  return db;
}

const globalForDb = globalThis as unknown as { __hoodieDb?: DatabaseSync };

export function getDb(): DatabaseSync {
  if (!globalForDb.__hoodieDb) globalForDb.__hoodieDb = open();
  return globalForDb.__hoodieDb;
}

/**
 * Runs fn inside BEGIN IMMEDIATE, which takes the database write lock up front.
 * Combined with synchronous node:sqlite calls, nothing else can write between
 * our availability check and our insert, in this process or any other.
 */
export function transaction<T>(fn: (db: DatabaseSync) => T): T {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn(db);
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && /UNIQUE constraint failed/i.test(err.message);
}

export function audit(actorId: number | null, action: string, details = '') {
  getDb().prepare('INSERT INTO audit_log (actor_id, action, details) VALUES (?, ?, ?)').run(actorId, action, details.slice(0, 500));
}
