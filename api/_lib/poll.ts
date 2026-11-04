import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { PollResults } from '../../shared/vote-contract.js';

export function readEnv(name: 'DATABASE_URL' | 'VOTE_HASH_PEPPER'): string | null {
  const value = process.env[name];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

/**
 * Excepción de pruebas, exclusivamente del servidor.
 *
 * Exige tres condiciones simultáneas: desarrollo local, el interruptor
 * explícito `VOTE_DEV_MODE=true` y que Vercel no esté en producción ni en
 * preview. En producción esta función devuelve siempre `false`, incluso si
 * alguien configurara el interruptor por error. No lee nada del navegador.
 */
export function isDevMode(): boolean {
  if (process.env.NODE_ENV !== 'development') return false;
  if (process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview') {
    return false;
  }
  return process.env.VOTE_DEV_MODE === 'true';
}

let client: NeonQueryFunction<false, false> | null = null;

/** Un cliente por instancia de función; la conexión HTTP es sin estado. */
export function getSql(): NeonQueryFunction<false, false> | null {
  const url = readEnv('DATABASE_URL');
  if (!url) return null;
  client ??= neon(url);
  return client;
}

interface ResultsRow {
  girl: number | string;
  boy: number | string;
  total: number | string;
  updated_at: string | Date | null;
}

const toCount = (value: number | string): number => {
  const parsed = typeof value === 'number' ? value : Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

/** Sólo datos agregados: nunca se devuelve un voto individual. */
export async function readResults(sql: NeonQueryFunction<false, false>): Promise<PollResults> {
  const rows = (await sql.query(
    `select
       count(*) filter (where prediction = 'girl')::int as girl,
       count(*) filter (where prediction = 'boy')::int  as boy,
       count(*)::int                                    as total,
       max(created_at)                                  as updated_at
     from votes`,
  )) as ResultsRow[];

  const row = rows[0];
  if (!row) return { girl: 0, boy: 0, total: 0, updatedAt: null };

  const updatedAt =
    row.updated_at instanceof Date ? row.updated_at.toISOString() : (row.updated_at ?? null);

  return {
    girl: toCount(row.girl),
    boy: toCount(row.boy),
    total: toCount(row.total),
    updatedAt,
  };
}

export async function readPollOpen(sql: NeonQueryFunction<false, false>): Promise<boolean> {
  const rows = (await sql.query(`select is_open from poll_settings where id = 1`)) as {
    is_open: boolean;
  }[];
  return rows[0]?.is_open === true;
}
