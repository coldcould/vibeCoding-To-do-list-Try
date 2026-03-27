import crypto from 'node:crypto';
import { config } from './config.js';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

type TokenPayload = {
  userId: string;
  email: string;
  exp: number;
};

function base64UrlEncode(input: string) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) {
    return false;
  }

  const derived = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHash, 'hex');

  return original.length === derived.length && crypto.timingSafeEqual(original, derived);
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function issueToken(userId: string, email: string) {
  const payload: TokenPayload = {
    userId,
    email,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string) {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(encodedPayload)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as TokenPayload;
  if (payload.exp < Date.now()) {
    return null;
  }

  return payload;
}
