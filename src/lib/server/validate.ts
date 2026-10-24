import 'server-only';
import { HttpError } from './http';

// Small, strict validators. Every value from the browser passes through one of these.

export function text(v: unknown, field: string, label: string, opts: { min?: number; max: number; optional?: boolean }): string {
  if (v === undefined || v === null) v = '';
  if (typeof v !== 'string') throw new HttpError(400, `${label} is not valid.`, field);
  // Strip control characters; keep normal punctuation and accents.
  const s = v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  const min = opts.optional ? 0 : (opts.min ?? 1);
  if (s.length < min) throw new HttpError(400, s.length === 0 ? `Please enter ${label.toLowerCase()}.` : `${label} is too short.`, field);
  if (s.length > opts.max) throw new HttpError(400, `${label} is too long (${opts.max} characters max).`, field);
  return s;
}

export function int(v: unknown, field: string, label: string, min: number, max: number): number {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) {
    throw new HttpError(400, `${label} must be between ${min} and ${max}.`, field);
  }
  return v;
}

export function money(v: unknown, field: string, label: string, min: number, max: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) {
    throw new HttpError(400, `${label} must be between ${min} and ${max}.`, field);
  }
  return Math.round(v * 100) / 100;
}

export function oneOf<T extends string>(v: unknown, options: readonly T[], field: string, label: string): T {
  if (typeof v !== 'string' || !options.includes(v as T)) throw new HttpError(400, `Please choose ${label.toLowerCase()}.`, field);
  return v as T;
}

export function bool(v: unknown): boolean {
  return v === true;
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

export function email(v: unknown, field = 'email'): string {
  const s = text(v, field, 'Email address', { max: 254 }).toLowerCase();
  if (!EMAIL_RE.test(s)) throw new HttpError(400, 'That email address does not look right. Please check it.', field);
  return s;
}

export function phone(v: unknown, field = 'phone'): string {
  const s = text(v, field, 'Phone number', { max: 25 });
  const digits = s.replace(/\D/g, '');
  if (!/^[+\d\s().-]+$/.test(s) || digits.length < 7 || digits.length > 15) {
    throw new HttpError(400, 'Please enter a valid phone number.', field);
  }
  return s;
}

export function password(v: unknown, field = 'password'): string {
  if (typeof v !== 'string') throw new HttpError(400, 'Please enter a password.', field);
  if (v.length < 8) throw new HttpError(400, 'Password must be at least 8 characters.', field);
  if (v.length > 200) throw new HttpError(400, 'Password is too long.', field);
  return v;
}

export function postcode(v: unknown, field = 'postcode'): string {
  const s = text(v, field, 'Postcode', { min: 2, max: 10 }).toUpperCase();
  if (!/^[A-Z0-9 -]+$/.test(s)) throw new HttpError(400, 'Please enter a valid postcode.', field);
  return s;
}
