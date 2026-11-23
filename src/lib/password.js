import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Password ko scrypt se hash karta hai. Format: scrypt$<salt-hex>$<hash-hex>
 * (Node built-in crypto — koi native/extra dependency nahi.)
 */
export async function hashPassword(plainPassword) {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(plainPassword, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

/** Plain password ko stored hash ke against verify karta hai. */
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
 * Password rules. Signup/reset dono jagah same validation.
 * @returns {string|null} error message, ya null agar valid hai
 */
export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password kam se kam 8 characters ka hona chahiye';
  }
  if (password.length > 128) {
    return 'Password 128 characters se zyada nahi ho sakta';
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password me kam se kam ek letter aur ek number hona chahiye';
  }
  return null;
}
