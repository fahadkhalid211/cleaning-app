import 'server-only';
import type { Addon, Catalog, Service } from '@/lib/types';
import { getDb } from './db';

interface ServiceRow {
  id: string;
  title: string;
  short: string;
  description: string;
  hourly_rate: number;
  min_hours: number;
  time_multiplier: number;
  icon: string;
  includes_json: string;
  active: number;
}

interface AddonRow {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_min: number;
  active: number;
}

const toService = (r: ServiceRow): Service => ({
  id: r.id,
  title: r.title,
  short: r.short,
  description: r.description,
  hourlyRate: r.hourly_rate,
  minHours: r.min_hours,
  timeMultiplier: r.time_multiplier,
  icon: r.icon,
  includes: JSON.parse(r.includes_json),
  active: r.active === 1,
});

const toAddon = (r: AddonRow): Addon => ({
  id: r.id,
  name: r.name,
  description: r.description,
  price: r.price,
  durationMin: r.duration_min,
  active: r.active === 1,
});

export function getCatalog(includeInactive = false): Catalog {
  const db = getDb();
  const where = includeInactive ? '' : 'WHERE active = 1';
  return {
    services: (db.prepare(`SELECT * FROM services ${where} ORDER BY sort, title`).all() as unknown as ServiceRow[]).map(toService),
    addons: (db.prepare(`SELECT * FROM addons ${where} ORDER BY sort, name`).all() as unknown as AddonRow[]).map(toAddon),
  };
}
