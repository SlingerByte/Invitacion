import type { PollResults, Prediction } from './vote-contract.js';

/**
 * Momento exacto de la revelación: domingo 15 de noviembre de 2026, 3:00 p. m.
 * en Colombia (UTC-5, sin horario de verano). El servidor es la única autoridad.
 */
export const REVEAL_AT_ISO = '2026-11-15T15:00:00-05:00';
export const REVEAL_AT_LABEL = 'domingo 15 de noviembre de 2026 · 3:00 p. m.';
export const REVEAL_AT_MS = Date.parse(REVEAL_AT_ISO);

export function isRevealed(now = Date.now()): boolean {
  return now >= REVEAL_AT_MS;
}

export interface RevealEntry {
  name: string;
  prediction: Prediction;
}

export interface RevealPayload {
  revealed: boolean;
  preview: boolean;
  revealAt: string;
  revealLabel: string;
  results: PollResults;
  entries: RevealEntry[];
}
