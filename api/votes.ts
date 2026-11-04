import {
  isPrediction,
  normalizeGuestName,
  type Prediction,
  type VoteOutcome,
} from '../shared/vote-contract.js';
import { fail, isSameOrigin, isSecureRequest, json, readJson } from './_lib/http.js';
import { getSql, isDevMode, readEnv, readResults } from './_lib/poll.js';
import { createVoterId, hashVoterId, readVoterId, voterCookie } from './_lib/voter.js';

export const config = { runtime: 'nodejs' };

interface VoteBody {
  prediction?: unknown;
  name?: unknown;
}

interface InsertRow {
  poll_open: boolean | null;
  prediction: string | null;
  inserted: boolean;
}

/**
 * POST /api/votes
 * Registra la predicción y el nombre del navegador actual. Es idempotente por
 * navegador: la restricción UNIQUE de Postgres es la que decide, no el frontend.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return fail(403, 'forbidden_origin');

  const body = await readJson<VoteBody>(request);
  if (!body) return fail(400, 'invalid_body');
  if (!isPrediction(body.prediction)) return fail(400, 'invalid_prediction');

  const guestName = normalizeGuestName(body.name);
  if (!guestName) return fail(400, 'invalid_name');

  const sql = getSql();
  const pepper = readEnv('VOTE_HASH_PEPPER');
  if (!sql || !pepper) return fail(503, 'not_configured');

  const voterId = readVoterId(request) ?? createVoterId();
  const voterHash = hashVoterId(voterId, pepper);
  const prediction: Prediction = body.prediction;
  const devMode = isDevMode();

  try {
    // En desarrollo el mismo navegador puede repetir la prueba: se actualiza
    // su fila en lugar de bloquearla. En producción sólo se inserta si no
    // existe; el índice UNIQUE sigue siendo la garantía real.
    const conflict = devMode
      ? `on conflict (voter_hash) do update
           set prediction = excluded.prediction,
               guest_name = excluded.guest_name,
               created_at = now()`
      : 'on conflict (voter_hash) do nothing';

    // Una única sentencia atómica: lee el estado de la votación, intenta
    // insertar y devuelve el voto efectivo (nuevo o preexistente).
    const rows = (await sql.query(
      `with settings as (
         select is_open from poll_settings where id = 1
       ),
       inserted as (
         insert into votes (voter_hash, prediction, guest_name)
         select $1::text, $2::text, $3::text
         from settings
         where settings.is_open
         ${conflict}
         returning prediction
       )
       select
         (select is_open from settings)                as poll_open,
         coalesce(
           (select prediction from inserted),
           (select prediction from votes where voter_hash = $1::text)
         )                                             as prediction,
         exists (select 1 from inserted)               as inserted`,
      [voterHash, prediction, guestName],
    )) as InsertRow[];

    const row = rows[0];
    if (!row) return fail(500, 'server_error');

    const results = await readResults(sql);
    const stored = isPrediction(row.prediction) ? row.prediction : null;
    const cookie = voterCookie(voterId, isSecureRequest(request));

    if (row.inserted && stored) {
      const payload: VoteOutcome = { status: 'recorded', prediction: stored, results };
      return json(payload, { headers: { 'set-cookie': cookie } });
    }

    if (stored) {
      const payload: VoteOutcome = { status: 'already_voted', prediction: stored, results };
      return json(payload, {
        status: devMode ? 200 : 409,
        headers: { 'set-cookie': cookie },
      });
    }

    const closed: VoteOutcome = { status: 'closed', results };
    return json(closed, { headers: { 'set-cookie': cookie } });
  } catch (error) {
    console.error('[votes] no se pudo registrar el voto', error);
    return fail(500, 'server_error');
  }
}
