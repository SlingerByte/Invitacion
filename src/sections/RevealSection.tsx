import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Lock, RefreshCw } from 'lucide-react';
import { event } from '@/config/event';
import { useReveal } from '@/hooks/useReveal';
import { cn } from '@/lib/cn';
import type { RevealEntry } from '@shared/reveal';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Sólo se usa en la vista de prueba local; nunca se envía desde producción. */
const PREVIEW_ENTRIES: readonly RevealEntry[] = [
  { name: 'Ana', prediction: 'girl' },
  { name: 'Camila', prediction: 'girl' },
  { name: 'Daniel', prediction: 'boy' },
  { name: 'Elena', prediction: 'girl' },
  { name: 'Felipe', prediction: 'boy' },
  { name: 'Gabriela', prediction: 'girl' },
];

function formatRemaining(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return 'Consultando la revelación…';
  }

  const totalSeconds = Math.ceil(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    const dayWord = days === 1 ? 'día' : 'días';
    if (hours > 0) {
      return `Faltan ${days} ${dayWord}, ${hours} h${minutes > 0 ? ` y ${minutes} min` : ''}`;
    }
    if (minutes > 0) return `Faltan ${days} ${dayWord} y ${minutes} min`;
    return `Faltan ${days} ${dayWord}`;
  }
  if (hours > 0) {
    return `Faltan ${hours} h${minutes > 0 ? ` y ${minutes} min` : ''}`;
  }
  if (minutes > 0) return `Faltan ${minutes} min y ${seconds} s`;
  return `Faltan ${seconds} s`;
}

function useCountdown(targetISO: string, active: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [active, targetISO]);

  const target = Date.parse(targetISO);
  return Number.isFinite(target) ? Math.max(0, target - now) : 0;
}

export function RevealSection() {
  const reduced = useReducedMotion() ?? false;
  const { state, retry } = useReveal();
  const data = state.kind === 'ready' ? state.data : null;
  const locked = Boolean(data && !data.revealed && !data.preview);
  const remaining = useCountdown(data?.revealAt ?? event.celebration.revealAtISO, locked);

  if (state.kind === 'loading') {
    return (
      <section id="revelacion" aria-labelledby="reveal-title" className="mt-14">
        <h2
          id="reveal-title"
          className="font-display text-rose-deep text-center text-[28px] leading-none"
        >
          Las predicciones
        </h2>
        <p className="text-blue-ink mt-6 flex items-center justify-center gap-2 text-[13px]">
          <span className="bg-gold size-1.5 animate-pulse rounded-full" aria-hidden="true" />
          Consultando la revelación…
        </p>
      </section>
    );
  }

  if (state.kind === 'error') {
    return (
      <section id="revelacion" aria-labelledby="reveal-title" className="mt-14">
        <h2
          id="reveal-title"
          className="font-display text-rose-deep text-center text-[28px] leading-none"
        >
          Las predicciones
        </h2>
        <div className="mx-auto mt-6 max-w-[300px] text-center">
          <p className="text-blue-ink text-[13.5px] leading-relaxed">
            No pudimos cargar la revelación. Inténtalo de nuevo en un momento.
          </p>
          <button
            type="button"
            onClick={retry}
            className="border-blue-deep text-blue-ink hover:border-gold focus-visible:outline-ink mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-[13px] font-medium tracking-[0.04em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <RefreshCw aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  const preview = data?.preview ?? false;
  const previewSample = preview && !data?.revealed && data?.entries.length === 0;
  const entries = previewSample ? PREVIEW_ENTRIES : (data?.entries ?? []);
  const sorted = [...entries].sort((a, b) =>
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
  );
  const girlCount = sorted.filter((entry) => entry.prediction === 'girl').length;
  const boyCount = sorted.length - girlCount;
  const revealLabel = data?.revealLabel ?? event.celebration.revealLabel;

  return (
    <section id="revelacion" aria-labelledby="reveal-title" className="mt-14">
      <div className="mb-6 flex items-center justify-center gap-2.5" aria-hidden="true">
        <span className="bg-gold/70 h-px w-9" />
        <span className="bg-gold size-1.5 rounded-full" />
        <span className="bg-gold/70 h-px w-9" />
      </div>

      <motion.h2
        id="reveal-title"
        initial={reduced ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="font-display text-rose-deep text-center text-[28px] leading-none"
      >
        {locked ? 'Las predicciones' : 'Quién votó qué'}
      </motion.h2>

      <p className="sr-only" role="status" aria-live="polite">
        {locked
          ? 'La revelación todavía no está disponible.'
          : `${preview ? 'Vista de prueba: ' : ''}${sorted.length} ${
              sorted.length === 1 ? 'predicción disponible' : 'predicciones disponibles'
            }.`}
      </p>

      {preview && (
        <div className="border-gold-deep/30 bg-gold/10 mx-auto mt-4 max-w-[330px] rounded-xl border px-3.5 py-2.5 text-center">
          <p className="text-blue-deep text-[11px] font-medium tracking-[0.14em] uppercase">
            Vista de prueba
          </p>
          <p className="text-blue-deep mt-1 text-[11.5px] leading-relaxed">
            {previewSample ? 'Datos de ejemplo. ' : ''}En producción se revela el {revealLabel}.
          </p>
        </div>
      )}

      {locked ? (
        <div className="mx-auto mt-6 max-w-[320px] text-center">
          <span className="bg-gold/15 text-gold-deep mx-auto flex size-10 items-center justify-center rounded-full">
            <Lock aria-hidden="true" className="size-4" strokeWidth={1.8} />
          </span>
          <p className="text-blue-ink mt-4 text-[15px] leading-relaxed">
            Los nombres y las predicciones se revelan el{' '}
            <time
              dateTime={data?.revealAt ?? event.celebration.revealAtISO}
              className="font-medium"
            >
              {revealLabel}
            </time>
            .
          </p>
          <p className="text-blue-deep mt-2 text-[12.5px] tracking-[0.04em] tabular-nums">
            {formatRemaining(remaining)}
          </p>
        </div>
      ) : (
        <>
          <p className="text-blue-deep mt-2 text-center text-[12.5px] leading-relaxed tracking-[0.04em]">
            {sorted.length === 0
              ? 'Todavía no hay predicciones para mostrar.'
              : `${sorted.length} ${
                  sorted.length === 1 ? 'predicción' : 'predicciones'
                } · ${girlCount} por Niña · ${boyCount} por Niño · en orden alfabético`}
          </p>

          {sorted.length > 0 && (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="border-blue-deep/15 mt-6 overflow-hidden rounded-2xl border bg-white"
            >
              <ul className="divide-blue-deep/10 divide-y">
                {sorted.map((entry, index) => (
                  <li
                    key={`${entry.name}-${entry.prediction}-${index}`}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <span className="text-blue-ink min-w-0 text-[15px] leading-snug font-medium tracking-[0.02em] break-words">
                      {entry.name}
                    </span>
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.04em]',
                        entry.prediction === 'girl'
                          ? 'bg-pink text-pink-ink'
                          : 'bg-sky text-sky-ink',
                      )}
                    >
                      {entry.prediction === 'girl' ? 'Niña' : 'Niño'}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </>
      )}
    </section>
  );
}
