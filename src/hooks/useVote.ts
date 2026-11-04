import { useCallback, useEffect, useState } from 'react';
import {
  guestNameIssue,
  normalizeGuestName,
  VOTE_NAME_MAX_LENGTH,
  type GuestNameIssue,
  type PollResults,
  type Prediction,
} from '@shared/vote-contract';
import {
  fetchResults,
  fetchVoteStatus,
  resetDevVote,
  submitVote,
  VoteApiError,
} from '@/lib/voteApi';

/**
 * Seis estados de interfaz:
 *  1. loading   — consultando el estado del navegador
 *  2. open      — votación abierta, aún sin elección
 *  3. selected  — elección hecha, formulario de nombre visible
 *  4. submitting— enviando la predicción
 *  5. recorded  — registrada (nueva o recuperada de este navegador)
 *  6. closed    — votación cerrada
 * `error` es el estado técnico de indisponibilidad, fuera de los seis.
 */
export type VotePhase =
  | { kind: 'loading' }
  | { kind: 'open' }
  | { kind: 'selected'; prediction: Prediction }
  | { kind: 'submitting'; prediction: Prediction }
  | { kind: 'recorded'; prediction: Prediction; already: boolean; results: PollResults | null }
  | { kind: 'closed'; results: PollResults | null }
  | { kind: 'error' };

const NETWORK_MESSAGE =
  'No pudimos conectar con la votación. Revisa tu conexión e inténtalo de nuevo.';
const SERVER_MESSAGE = 'No pudimos registrar tu voto en este momento. Inténtalo otra vez.';
const TIMEOUT_MESSAGE =
  'No alcanzamos a registrar tu voto. Tu predicción sigue aquí; inténtalo otra vez.';

const NAME_MESSAGES: Record<GuestNameIssue, string> = {
  empty: 'Escribe tu nombre para acompañar tu predicción.',
  too_short: 'Escribe al menos 2 letras de tu nombre.',
  too_long: `El nombre no puede pasar de ${VOTE_NAME_MAX_LENGTH} caracteres.`,
  invalid_characters: 'Usa solo letras, espacios, punto, apóstrofo o guion.',
};

const LOAD_TIMEOUT_MS = 12_000;
const SUBMIT_TIMEOUT_MS = 12_000;

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), milliseconds);
    }),
  ]);
}

export function useVote() {
  const [phase, setPhase] = useState<VotePhase>({ kind: 'loading' });
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [devMode, setDevMode] = useState(false);
  const [devResetError, setDevResetError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      const [statusResult, resultsResult] = await Promise.allSettled([
        withTimeout(fetchVoteStatus(controller.signal), LOAD_TIMEOUT_MS),
        withTimeout(fetchResults(controller.signal), LOAD_TIMEOUT_MS),
      ]);

      if (!active) return;

      if (statusResult.status === 'rejected') {
        setPhase({ kind: 'error' });
        return;
      }

      const status = statusResult.value;
      const results = resultsResult.status === 'fulfilled' ? resultsResult.value : null;
      setDevMode(status.devMode);

      if (status.hasVoted && status.prediction) {
        setPhase({
          kind: 'recorded',
          prediction: status.prediction,
          already: true,
          results,
        });
        return;
      }

      if (!status.pollOpen) {
        setPhase({ kind: 'closed', results });
        return;
      }

      setPhase({ kind: 'open' });
    };

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setSubmitError(null);
    setDevResetError(null);
    setPhase({ kind: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  /** Sólo se muestra cuando el servidor confirma `devMode`. */
  const restartDev = useCallback(async () => {
    setDevResetError(null);
    try {
      await resetDevVote(AbortSignal.timeout(SUBMIT_TIMEOUT_MS));
      setName('');
      setBurst(0);
      setSubmitError(null);
      setPhase({ kind: 'loading' });
      setAttempt((value) => value + 1);
    } catch {
      setDevResetError('No pudimos reiniciar la prueba. Inténtalo otra vez.');
    }
  }, []);

  const choose = useCallback(
    (prediction: Prediction) => {
      if (phase.kind !== 'open' && phase.kind !== 'selected') return;
      setPhase({ kind: 'selected', prediction });
      setNameError(null);
      setSubmitError(null);
      setBurst((value) => value + 1);
    },
    [phase.kind],
  );

  const changeName = useCallback((value: string) => {
    setName(value.slice(0, VOTE_NAME_MAX_LENGTH));
    setNameError(null);
    setSubmitError(null);
  }, []);

  const submit = useCallback(async () => {
    if (phase.kind !== 'selected') return;

    const issue = guestNameIssue(name);
    if (issue) {
      setNameError(NAME_MESSAGES[issue]);
      return;
    }

    const normalized = normalizeGuestName(name);
    if (!normalized) {
      setNameError(NAME_MESSAGES.invalid_characters);
      return;
    }

    const prediction = phase.prediction;
    setNameError(null);
    setSubmitError(null);
    setPhase({ kind: 'submitting', prediction });

    try {
      const outcome = await submitVote(
        prediction,
        normalized,
        AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
      );

      if (outcome.status === 'recorded') {
        setPhase({
          kind: 'recorded',
          prediction: outcome.prediction,
          already: false,
          results: outcome.results,
        });
        return;
      }

      if (outcome.status === 'already_voted') {
        setPhase({
          kind: 'recorded',
          prediction: outcome.prediction,
          already: true,
          results: outcome.results,
        });
        return;
      }

      setPhase({ kind: 'closed', results: outcome.results });
    } catch (error) {
      setPhase({ kind: 'selected', prediction });
      if (error instanceof VoteApiError && error.code === 'invalid_name') {
        setNameError(NAME_MESSAGES.invalid_characters);
        return;
      }
      if (error instanceof VoteApiError && error.code === 'server_error') {
        setSubmitError(SERVER_MESSAGE);
        return;
      }
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        setSubmitError(TIMEOUT_MESSAGE);
        return;
      }
      setSubmitError(NETWORK_MESSAGE);
    }
  }, [name, phase]);

  return {
    phase,
    name,
    nameError,
    submitError,
    burst,
    devMode,
    devResetError,
    choose,
    changeName,
    submit,
    retry,
    restartDev,
  };
}
