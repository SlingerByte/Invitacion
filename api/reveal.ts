import {
  isRevealed,
  REVEAL_AT_ISO,
  REVEAL_AT_LABEL,
  type RevealEntry,
  type RevealPayload,
} from '../shared/reveal.js';
import { isPrediction } from '../shared/vote-contract.js';
import { fail, json } from './_lib/http.js';
import { getSql, isDevMode, readResults } from './_lib/poll.js';

export const config = { runtime: 'nodejs' };

interface RevealRow {
  name: string | null;
  prediction: string | null;
}

/**
 * GET /api/reveal
 *
 * Antes de la hora de revelación no consulta ni devuelve nombres. En
 * producción la fecha la decide el reloj del servidor (`isRevealed`), nunca el
 * navegador. En desarrollo, `isDevMode()` permite la vista previa con datos
 * reales; sigue siendo una condición exclusiva del servidor.
 */
export async function GET(): Promise<Response> {
  const sql = getSql();
  if (!sql) return fail(503, 'not_configured');

  const revealed = isRevealed();
  const preview = isDevMode();

  try {
    const results = await readResults(sql);

    if (!revealed && !preview) {
      const payload: RevealPayload = {
        revealed: false,
        preview: false,
        revealAt: REVEAL_AT_ISO,
        revealLabel: REVEAL_AT_LABEL,
        results,
        entries: [],
      };
      return json(payload);
    }

    const rows = (await sql.query(
      `select guest_name as name, prediction
       from votes
       where guest_name is not null
       order by lower(guest_name) asc, created_at asc`,
    )) as RevealRow[];

    const entries: RevealEntry[] = [];
    for (const row of rows) {
      const name = typeof row.name === 'string' ? row.name.trim() : '';
      if (name && isPrediction(row.prediction)) {
        entries.push({ name, prediction: row.prediction });
      }
    }

    const payload: RevealPayload = {
      revealed,
      preview,
      revealAt: REVEAL_AT_ISO,
      revealLabel: REVEAL_AT_LABEL,
      results,
      entries,
    };
    return json(payload);
  } catch (error) {
    console.error('[reveal] no se pudo leer la revelación', error);
    return fail(500, 'server_error');
  }
}
