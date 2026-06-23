/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Minimal password hashing using Node's built-in crypto.scrypt.
 * The original server.ts stored passwords in plaintext inside the JSON
 * "database" — fine for nothing, dangerous for anything real. This adds
 * salted hashing with zero new dependencies.
 */

import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, derivedHex] = stored.split(':');
  if (!salt || !derivedHex) return false;
  const derived = Buffer.from(derivedHex, 'hex');
  const candidate = scryptSync(password, salt, KEY_LENGTH);
  if (candidate.length !== derived.length) return false;
  return timingSafeEqual(candidate, derived);
}
