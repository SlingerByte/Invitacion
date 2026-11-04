/**
 * Contrato compartido entre el frontend y las funciones serverless.
 * Es la única fuente de verdad sobre la forma de la votación: si cambia aquí,
 * cambia en los dos lados y TypeScript lo detecta.
 */

export const PREDICTIONS = ['girl', 'boy'] as const;
export type Prediction = (typeof PREDICTIONS)[number];

export function isPrediction(value: unknown): value is Prediction {
  return value === 'girl' || value === 'boy';
}

/**
 * Límites del nombre que escribe el invitado. No son autenticación: el nombre
 * acompaña la predicción y se guarda tal como la persona lo escribió.
 */
export const VOTE_NAME_MIN_LENGTH = 2;
export const VOTE_NAME_MAX_LENGTH = 40;

/**
 * Normaliza y valida el nombre en un solo lugar, para que el navegador y la API
 * apliquen exactamente las mismas reglas. Devuelve `null` si no es aceptable.
 */
export type GuestNameIssue = 'empty' | 'too_short' | 'too_long' | 'invalid_characters';

export function guestNameIssue(value: unknown): GuestNameIssue | null {
  if (typeof value !== 'string') return 'invalid_characters';

  const normalized = value.normalize('NFC').replace(/\s+/g, ' ').trim();
  if (normalized.length === 0) return 'empty';
  if (normalized.length < VOTE_NAME_MIN_LENGTH) return 'too_short';
  if (normalized.length > VOTE_NAME_MAX_LENGTH) return 'too_long';

  // Letras (con tildes y diéresis), marcas, espacios, punto, apóstrofo y guion.
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u.test(normalized)) return 'invalid_characters';
  if (!/\p{L}/u.test(normalized)) return 'invalid_characters';

  return null;
}

export function normalizeGuestName(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const normalized = value.normalize('NFC').replace(/\s+/g, ' ').trim();
  return guestNameIssue(normalized) === null ? normalized : null;
}

export interface PollResults {
  girl: number;
  boy: number;
  total: number;
  /** ISO date of the most recent vote, null when the poll has no votes yet. */
  updatedAt: string | null;
}

export interface VoteStatus {
  hasVoted: boolean;
  prediction: Prediction | null;
  pollOpen: boolean;
  /**
   * Verdadero sólo en el servidor de desarrollo local. El navegador nunca
   * decide este valor; en producción siempre es falso.
   */
  devMode: boolean;
}

export type VoteOutcome =
  | { status: 'recorded'; prediction: Prediction; results: PollResults }
  | { status: 'already_voted'; prediction: Prediction; results: PollResults }
  | { status: 'closed'; results: PollResults };

export type ApiErrorCode =
  | 'invalid_prediction'
  | 'invalid_name'
  | 'invalid_body'
  | 'poll_closed'
  | 'not_configured'
  | 'forbidden_origin'
  | 'method_not_allowed'
  | 'not_found'
  | 'server_error';

export interface ApiErrorBody {
  error: ApiErrorCode;
}

export const EMPTY_RESULTS: PollResults = { girl: 0, boy: 0, total: 0, updatedAt: null };
