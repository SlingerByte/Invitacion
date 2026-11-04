import { isPrediction } from '../shared/vote-contract';
import { fail, isSecureRequest, json } from './_lib/http';
import { getSql, isDevMode, readEnv, readPollOpen } from './_lib/poll';
import { createVoterId, hashVoterId, readVoterId, voterCookie } from './_lib/voter';

export const config = { runtime: 'nodejs' };

/**
 * GET /api/vote-status
 * Devuelve si este navegador ya votó. Si aún no tiene cookie, se le asigna una
 * aquí (HttpOnly), de modo que la identidad existe antes de emitir el voto.
 * Nunca devuelve identificadores ni votos de otras personas.
 */
export async function GET(request: Request): Promise<Response> {
  const sql = getSql();
  const pepper = readEnv('VOTE_HASH_PEPPER');
  if (!sql || !pepper) return fail(503, 'not_configured');

  const existing = readVoterId(request);
  const voterId = existing ?? createVoterId();
  const voterHash = hashVoterId(voterId, pepper);

  try {
    const rows = (await sql.query(
      `select prediction from votes where voter_hash = $1::text limit 1`,
      [voterHash],
    )) as { prediction: string | null }[];
    const pollOpen = await readPollOpen(sql);
    const prediction = rows[0]?.prediction;

    return json(
      {
        hasVoted: isPrediction(prediction),
        prediction: isPrediction(prediction) ? prediction : null,
        pollOpen,
        devMode: isDevMode(),
      },
      { headers: { 'set-cookie': voterCookie(voterId, isSecureRequest(request)) } },
    );
  } catch (error) {
    console.error('[vote-status] no se pudo leer el estado', error);
    return fail(500, 'server_error');
  }
}
