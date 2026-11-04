import { motion, useReducedMotion } from 'motion/react';
import type { PollResults } from '@shared/vote-contract';
import { cn } from '@/lib/cn';

interface VoteResultsProps {
  results: PollResults | null;
  className?: string;
}

interface ResultRowProps {
  label: string;
  count: number;
  percentage: number;
  tone: 'pink' | 'blue';
}

function ResultRow({ label, count, percentage, tone }: ResultRowProps) {
  const reduced = useReducedMotion() ?? false;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-[13px]">
        <span
          className={cn('font-medium', tone === 'pink' ? 'text-rose-ink' : 'text-blue-ink')}
        >
          {label}
        </span>
        <span className="text-blue-ink">
          {count} · {percentage}%
        </span>
      </div>
      <div
        className="bg-star-blue/50 mt-1.5 h-1.5 overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <motion.div
          className={cn('h-full rounded-full', tone === 'pink' ? 'bg-pink' : 'bg-sky')}
          initial={reduced ? false : { width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

/** Sólo cifras reales y agregadas: nunca nombres ni filas individuales. */
export function VoteResults({ results, className }: VoteResultsProps) {
  const total = results?.total ?? 0;
  const girl = results?.girl ?? 0;
  const boy = results?.boy ?? 0;

  if (!results) {
    return (
      <p className={cn('text-blue-ink text-center text-[13px] leading-relaxed', className)}>
        Los resultados no están disponibles en este momento.
      </p>
    );
  }

  if (total === 0) {
    return (
      <div className={cn('text-center', className)}>
        <div className="mb-4 flex items-center justify-center gap-3" aria-hidden="true">
          <span className="bg-gold/60 h-px w-8" />
          <span className="bg-gold size-1.5 rounded-full" />
          <span className="bg-gold/60 h-px w-8" />
        </div>
        <p className="text-blue-deep text-[14px] leading-relaxed">
          Todavía no hay predicciones registradas.
        </p>
      </div>
    );
  }

  const girlPercentage = Math.round((girl / total) * 100);
  const boyPercentage = 100 - girlPercentage;

  return (
    <div
      className={cn('w-full', className)}
      role="group"
      aria-label="Resultados agregados de la votación"
    >
      <div className="flex items-center justify-center gap-3" aria-hidden="true">
        <span className="bg-gold/60 h-px w-8" />
        <span className="text-blue-ink text-[12px] tracking-[0.18em] uppercase">
          Resultados
        </span>
        <span className="bg-gold/60 h-px w-8" />
      </div>

      <div className="mt-4 space-y-3.5">
        <ResultRow label="Niño" count={boy} percentage={boyPercentage} tone="blue" />
        <ResultRow label="Niña" count={girl} percentage={girlPercentage} tone="pink" />
      </div>

      <p className="text-blue-deep mt-4 text-center text-[12px] tracking-[0.1em]">
        {total === 1 ? '1 predicción' : `${total} predicciones`}
      </p>
    </div>
  );
}
