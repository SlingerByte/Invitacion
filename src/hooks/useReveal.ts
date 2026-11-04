import { useCallback, useEffect, useRef, useState } from 'react';
import type { RevealPayload } from '@shared/reveal';
import { fetchReveal } from '@/lib/voteApi';

export type RevealState =
  { kind: 'loading' } | { kind: 'ready'; data: RevealPayload } | { kind: 'error' };

const POLL_MS = 15_000;

/**
 * El servidor decide si ya es la hora. Mientras la revelación está bloqueada,
 * se consulta cada 15 s para que la página abierta cambie sola a las 3:00 p. m.
 * de Colombia, sin confiar en el reloj del navegador.
 */
export function useReveal() {
  const [state, setState] = useState<RevealState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const stopPolling = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const load = async () => {
      try {
        const data = await fetchReveal(controller.signal);
        if (!active) return;
        stopPolling.current = data.revealed;
        setState({ kind: 'ready', data });
      } catch {
        if (!active) return;
        setState((current) => (current.kind === 'ready' ? current : { kind: 'error' }));
      }
    };

    void load();
    const interval = setInterval(() => {
      if (!stopPolling.current) void load();
    }, POLL_MS);

    return () => {
      active = false;
      controller.abort();
      clearInterval(interval);
    };
  }, [attempt]);

  // Además del sondeo, despierta justo después de la hora objetivo. Si el
  // reloj local está desfasado, el sondeo de 15 s sigue siendo el respaldo.
  useEffect(() => {
    if (state.kind !== 'ready' || state.data.revealed || state.data.preview) return;
    const target = Date.parse(state.data.revealAt);
    if (!Number.isFinite(target)) return;
    const delay = target - Date.now();
    if (delay <= 0 || delay > 2_147_000_000) return;

    const timeout = setTimeout(() => {
      stopPolling.current = false;
      setAttempt((value) => value + 1);
    }, delay + 1_500);
    return () => clearTimeout(timeout);
  }, [state]);

  const retry = useCallback(() => {
    stopPolling.current = false;
    setState({ kind: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  return { state, retry };
}
