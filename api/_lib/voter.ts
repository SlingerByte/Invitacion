import { createHmac, randomBytes } from 'node:crypto';

export const VOTER_COOKIE = 'reveal_voter';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Lee el identificador aleatorio de la cookie HttpOnly, si existe. */
export function readVoterId(request: Request): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;

  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === VOTER_COOKIE) {
      const value = decodeURIComponent(rest.join('='));
      return /^[A-Za-z0-9_-]{16,64}$/.test(value) ? value : null;
    }
  }
  return null;
}

/** Identificador nuevo: 18 bytes aleatorios, sin ningún dato del usuario. */
export function createVoterId(): string {
  return randomBytes(18).toString('base64url');
}

/**
 * En Postgres sólo se guarda el HMAC del identificador. Con el pepper en
 * secreto, la tabla no permite reconstruir la cookie de nadie.
 */
export function hashVoterId(voterId: string, pepper: string): string {
  return createHmac('sha256', pepper).update(voterId).digest('hex');
}

export function voterCookie(voterId: string, secure: boolean): string {
  const attributes = [
    `${VOTER_COOKIE}=${voterId}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${ONE_YEAR_SECONDS}`,
  ];
  if (secure) attributes.push('Secure');
  return attributes.join('; ');
}
