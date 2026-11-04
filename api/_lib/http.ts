import type { ApiErrorCode } from '../../shared/vote-contract';

export const NO_STORE = 'no-store, max-age=0';

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', NO_STORE);
  headers.set('x-content-type-options', 'nosniff');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function fail(status: number, error: ApiErrorCode): Response {
  return json({ error } satisfies { error: ApiErrorCode }, { status });
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // same-origin GET/no-Origin mutaciones no llegan aquí
  const host = request.headers.get('host') ?? request.headers.get('x-forwarded-host');
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function isSecureRequest(request: Request): boolean {
  const proto = request.headers.get('x-forwarded-proto');
  if (proto) return proto.split(',')[0]?.trim() === 'https';
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return true;
  }
}

export function readJson<T>(request: Request): Promise<T | null> {
  return request
    .json()
    .then((value: unknown) =>
      typeof value === 'object' && value !== null ? (value as T) : null,
    )
    .catch(() => null);
}
