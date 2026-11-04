import { fail, json } from './_lib/http';
import { getSql, readResults } from './_lib/poll';

export const config = { runtime: 'nodejs' };

/**
 * GET /api/results
 * Resultados agregados de la votación. Sin datos personales, nunca por voto.
 */
export async function GET(): Promise<Response> {
  const sql = getSql();
  if (!sql) return fail(503, 'not_configured');

  try {
    const results = await readResults(sql);
    return json(results);
  } catch (error) {
    console.error('[results] no se pudieron leer los resultados', error);
    return fail(500, 'server_error');
  }
}
