import 'server-only';
import { startSession } from './auth';
import { audit, getDb, isUniqueViolation } from './db';
import { HttpError } from './http';
import { hashPassword } from './passwords';
import * as v from './validate';

/** Creates a customer account and logs them in. The role is fixed here, never taken from the request. */
export async function registerCustomer(body: Record<string, unknown>): Promise<number> {
  const name = v.text(body.name, 'name', 'Your name', { min: 2, max: 80 });
  const email = v.email(body.email);
  const phone = v.phone(body.phone);
  const password = v.password(body.password);

  let id: number;
  try {
    const res = getDb()
      .prepare("INSERT INTO users (role, name, email, phone, password_hash) VALUES ('customer', ?, ?, ?, ?)")
      .run(name, email, phone, hashPassword(password));
    id = Number(res.lastInsertRowid);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new HttpError(409, 'There is already an account with this email. Please log in instead.', 'email');
    }
    throw err;
  }
  audit(id, 'account.register', email);
  await startSession({ id, role: 'customer' });
  return id;
}

/** Creates a cleaner account and logs them in. */
export async function registerCleaner(body: Record<string, unknown>): Promise<number> {
  const name = v.text(body.name, 'name', 'Your name', { min: 2, max: 80 });
  const email = v.email(body.email);
  const phone = v.phone(body.phone);
  const password = v.password(body.password);

  let id: number;
  try {
    const res = getDb()
      .prepare("INSERT INTO users (role, name, email, phone, password_hash, active) VALUES ('cleaner', ?, ?, ?, ?, 1)")
      .run(name, email, phone, hashPassword(password));
    id = Number(res.lastInsertRowid);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new HttpError(409, 'There is already an account with this email. Please log in instead.', 'email');
    }
    throw err;
  }
  audit(id, 'cleaner.register', email);
  await startSession({ id, role: 'cleaner' });
  return id;
}

export function createCleaner(adminId: number, body: Record<string, unknown>) {
  const name = v.text(body.name, 'name', 'Name', { min: 2, max: 80 });
  const email = v.email(body.email);
  const phone = v.phone(body.phone);
  const password = v.password(body.password);
  try {
    const res = getDb()
      .prepare("INSERT INTO users (role, name, email, phone, password_hash) VALUES ('cleaner', ?, ?, ?, ?)")
      .run(name, email, phone, hashPassword(password));
    audit(adminId, 'admin.cleaner.create', email);
    return Number(res.lastInsertRowid);
  } catch (err) {
    if (isUniqueViolation(err)) throw new HttpError(409, 'That email is already used by another account.', 'email');
    throw err;
  }
}
