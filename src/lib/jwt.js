/**
 * File: src/lib/jwt.js
 *
 * Small HS256 JWT helper built on Web Crypto, so it works in both the Node
 * runtime (API routes) and the Edge runtime (middleware). No external library.
 * Secret: AUTH_SECRET env var (32+ characters).
 */
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'AUTH_SECRET is missing or too short. Put a random string of at least 32 characters in .env.local.'
    );
  }
  return secret;
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function encodeJson(value) {
  return bytesToBase64Url(encoder.encode(JSON.stringify(value)));
}

async function getKey() {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/** Signs the payload and returns a JWT string. */
export async function signToken(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: issuedAt, exp: issuedAt + expiresInSeconds };
  const data = `${encodeJson({ alg: 'HS256', typ: 'JWT' })}.${encodeJson(body)}`;
  const signature = await crypto.subtle.sign('HMAC', await getKey(), encoder.encode(data));
  return `${data}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

/** Verifies a token. Returns the payload if valid, otherwise null. */
export async function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerPart, payloadPart, signaturePart] = parts;

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await getKey(),
      base64UrlToBytes(signaturePart),
      encoder.encode(`${headerPart}.${payloadPart}`)
    );
    if (!valid) return null;

    const payload = JSON.parse(decoder.decode(base64UrlToBytes(payloadPart)));
    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

/** SHA-256 hex hash of a session token (the plain token is never stored in the DB). */
export async function hashToken(token) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(token));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
