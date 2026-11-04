import type {
  ApiErrorBody,
  ApiErrorCode,
  PollResults,
  Prediction,
  VoteOutcome,
  VoteStatus,
} from '@shared/vote-contract';

export class VoteApiError extends Error {
  readonly code: ApiErrorCode | 'network_error';

  constructor(code: ApiErrorCode | 'network_error') {
    super(code);
    this.name = 'VoteApiError';
    this.code = code;
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new VoteApiError(body?.error ?? 'server_error');
  }
  return (await response.json()) as T;
}

export async function fetchVoteStatus(signal?: AbortSignal): Promise<VoteStatus> {
  try {
    const response = await fetch('/api/vote-status', {
      cache: 'no-store',
      headers: { accept: 'application/json' },
      ...(signal ? { signal } : {}),
    });
    return await readResponse<VoteStatus>(response);
  } catch (error) {
    if (error instanceof VoteApiError) throw error;
    throw new VoteApiError('network_error');
  }
}

export async function fetchResults(signal?: AbortSignal): Promise<PollResults> {
  try {
    const response = await fetch('/api/results', {
      cache: 'no-store',
      headers: { accept: 'application/json' },
      ...(signal ? { signal } : {}),
    });
    return await readResponse<PollResults>(response);
  } catch (error) {
    if (error instanceof VoteApiError) throw error;
    throw new VoteApiError('network_error');
  }
}

export async function submitVote(
  prediction: Prediction,
  name: string,
  signal?: AbortSignal,
): Promise<VoteOutcome> {
  try {
    const response = await fetch('/api/votes', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ prediction, name }),
      ...(signal ? { signal } : {}),
    });

    // 409 es un rechazo válido: el navegador ya tenía un voto. El cuerpo sigue
    // siendo un VoteOutcome, no un error genérico.
    if (response.status === 409) {
      const body = (await response.json().catch(() => null)) as
        VoteOutcome | ApiErrorBody | null;
      if (body && 'status' in body) return body;
      throw new VoteApiError((body as ApiErrorBody | null)?.error ?? 'server_error');
    }

    return await readResponse<VoteOutcome>(response);
  } catch (error) {
    if (error instanceof VoteApiError) throw error;
    throw new VoteApiError('network_error');
  }
}

/** Sólo funciona en el servidor de desarrollo; en producción responde 404. */
export async function resetDevVote(signal?: AbortSignal): Promise<void> {
  try {
    const response = await fetch('/api/dev/reset', {
      method: 'POST',
      cache: 'no-store',
      headers: { accept: 'application/json' },
      ...(signal ? { signal } : {}),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
      throw new VoteApiError(body?.error ?? 'server_error');
    }
  } catch (error) {
    if (error instanceof VoteApiError) throw error;
    throw new VoteApiError('network_error');
  }
}
