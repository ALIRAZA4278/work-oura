/**
 * File: src/lib/password.js
 *
 * Password hashing and rules. Uses Node's built-in scrypt with a random salt.
 * Stored format in accounts.password_hash: scrypt$<salt-hex>$<hash-hex>
 */
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hashes a password with scrypt. Format: scrypt$<salt-hex>$<hash-hex>
 * (Node's built-in crypto, no extra dependency.)
 */
export async function hashPassword(plainPassword) {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(plainPassword, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

/** Checks a plain password against the stored hash. */
export async function verifyPassword(plainPassword, storedHash) {
  if (!plainPassword || !storedHash) return false;

  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const [, saltHex, hashHex] = parts;

  try {
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const derived = await scrypt(plainPassword, salt, expected.length);
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Password rules, shared by sign-up and password reset.
 * @returns {string|null} error message, or null if valid
 */
export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (password.length > 128) {
    return 'Password cannot be longer than 128 characters';
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  return null;
}
