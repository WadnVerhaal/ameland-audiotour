import crypto from 'node:crypto';

export function createAccessToken(): string {
  return crypto.randomBytes(24).toString('hex');
}
