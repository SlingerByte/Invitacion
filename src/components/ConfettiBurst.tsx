import { motion, useReducedMotion } from 'motion/react';
import type { Prediction } from '@shared/vote-contract';
import { cn } from '@/lib/cn';

const COLORS: Record<Prediction, readonly string[]> = {
  girl: [
    'var(--color-pink)',
    'var(--color-star-pink)',
    'var(--color-balloon-pink)',
    'var(--color-gold)',
  ],
  boy: [
    'var(--color-sky)',
    'var(--color-star-blue)',
    'var(--color-balloon-blue)',
    'var(--color-gold)',
  ],
};

const PARTICLES = Array.from({ length: 20 }, (_, index) => {
  const angle = (index / 20) * Math.PI * 2 + (index % 3) * 0.18;
  const distance = 34 + (index % 6) * 13;
  return {
    dx: Math.cos(angle) * distance,
    dy: Math.sin(angle) * distance - 26,
    rotate: (index % 2 === 0 ? 1 : -1) * (110 + index * 13),
    delay: 0.06 + (index % 4) * 0.035,
    duration: 0.82 + (index % 3) * 0.14,
    round: index % 4 === 0,
    size: 4 + (index % 3) * 2,
  };
});

interface ConfettiBurstProps {
  prediction: Prediction;
  /** Posición del origen dentro del contenedor relativo. */
  className?: string;
}

/** Explosión breve y local: no bloquea la lectura ni se repite sola. */
export function ConfettiBurst({ prediction, className }: ConfettiBurstProps) {
  const reduced = useReducedMotion() ?? false;
  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute z-20 h-0 w-0',
        className ?? 'top-1/2 left-1/2',
      )}
    >
      {PARTICLES.map((particle, index) => {
        const color =
          COLORS[prediction][index % COLORS[prediction].length] ?? COLORS[prediction][0];
        return (
          <motion.span
            key={index}
            className="absolute"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size + (particle.round ? 0 : 4)}px`,
              marginLeft: `${-particle.size / 2}px`,
              marginTop: `${-(particle.size + 4) / 2}px`,
              borderRadius: particle.round ? '999px' : '1px',
              backgroundColor: color,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.6, rotate: 0 }}
            animate={{
              x: particle.dx,
              y: particle.dy,
              opacity: 0,
              scale: 0.9,
              rotate: particle.rotate,
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}
