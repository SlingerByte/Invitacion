import { fail, isSameOrigin, json } from './_lib/http';
import { getSql, isDevMode, readEnv } from './_lib/poll';
import { hashVoterId, readVoterId } from './_lib/voter';

export const config = { runtime: 'nodejs' };

/**
 * POST /api/dev/reset
 * Borra el voto de este navegador para repetir la prueba. Sólo existe en el
 * servidor de desarrollo local; en producción responde 404 y no hay forma
 * pública de habilitarlo.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return fail(403, 'forbidden_origin');
  if (!isDevMode()) return fail(404, 'not_found');

  const sql = getSql();
  const pepper = readEnv('VOTE_HASH_PEPPER');
  if (!sql || !pepper) return fail(503, 'not_configured');

  const voterId = readVoterId(request);
  if (voterId) {
    const voterHash = hashVoterId(voterId, pepper);
    await sql.query('delete from votes where voter_hash = $1::text', [voterHash]);
  }

  return json({ reset: true });
}
