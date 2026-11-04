import type { CSSProperties } from 'react';

interface Star {
  top: number;
  left: number;
  size: number;
  tone: 'pink' | 'blue';
  opacity: number;
  delay: number;
  duration: number;
  shape?: 'sparkle';
}

/**
 * Distribución pensada para dejar libre la columna central de lectura: las
 * estrellas viven en los márgenes, repartidas de arriba abajo para que la
 * lámina nunca quede vacía en los tramos largos.
 */
const STARS: Star[] = [
  { top: 2, left: 6, size: 11, tone: 'pink', opacity: 0.6, delay: 0, duration: 5.1 },
  { top: 3.5, left: 93, size: 9, tone: 'blue', opacity: 0.7, delay: 1.4, duration: 4.7 },
  { top: 5, left: 2.5, size: 7, tone: 'blue', opacity: 0.66, delay: 2.6, duration: 5.4 },
  {
    top: 6.5,
    left: 96.5,
    size: 13,
    tone: 'pink',
    opacity: 0.5,
    delay: 0.8,
    duration: 6,
    shape: 'sparkle',
  },
  { top: 8, left: 8, size: 14, tone: 'blue', opacity: 0.55, delay: 3.4, duration: 4.9 },
  { top: 9.5, left: 90, size: 8, tone: 'pink', opacity: 0.72, delay: 0.3, duration: 5.6 },
  { top: 11.5, left: 3, size: 10, tone: 'pink', opacity: 0.62, delay: 1.9, duration: 5.2 },
  { top: 13, left: 94.5, size: 12, tone: 'blue', opacity: 0.58, delay: 2.2, duration: 4.4 },
  { top: 15, left: 6.5, size: 8, tone: 'blue', opacity: 0.7, delay: 3.9, duration: 5.8 },
  {
    top: 16.5,
    left: 97,
    size: 9,
    tone: 'pink',
    opacity: 0.64,
    delay: 0.5,
    duration: 4.6,
    shape: 'sparkle',
  },
  { top: 18.5, left: 2, size: 13, tone: 'pink', opacity: 0.52, delay: 2.8, duration: 6.2 },
  { top: 20, left: 91.5, size: 16, tone: 'blue', opacity: 0.48, delay: 1.1, duration: 5 },
  { top: 22, left: 7.5, size: 9, tone: 'blue', opacity: 0.68, delay: 4.2, duration: 4.8 },
  { top: 23.5, left: 95, size: 8, tone: 'pink', opacity: 0.74, delay: 0.9, duration: 5.5 },
  { top: 25.5, left: 3.5, size: 11, tone: 'pink', opacity: 0.6, delay: 2.4, duration: 5.9 },
  { top: 27, left: 89.5, size: 10, tone: 'blue', opacity: 0.66, delay: 3.1, duration: 4.3 },
  {
    top: 29,
    left: 6,
    size: 14,
    tone: 'blue',
    opacity: 0.5,
    delay: 0.6,
    duration: 6.4,
    shape: 'sparkle',
  },
  { top: 30.5, left: 96, size: 9, tone: 'pink', opacity: 0.7, delay: 1.7, duration: 4.9 },
  { top: 32.5, left: 2.5, size: 8, tone: 'pink', opacity: 0.62, delay: 3.7, duration: 5.3 },
  { top: 34, left: 92, size: 13, tone: 'blue', opacity: 0.54, delay: 0.2, duration: 5.7 },
  { top: 36, left: 7, size: 10, tone: 'blue', opacity: 0.68, delay: 2.9, duration: 4.5 },
  { top: 37.5, left: 94.5, size: 9, tone: 'pink', opacity: 0.72, delay: 4.4, duration: 6.1 },
  { top: 39.5, left: 3, size: 15, tone: 'pink', opacity: 0.5, delay: 1.3, duration: 5 },
  { top: 41, left: 90.5, size: 8, tone: 'blue', opacity: 0.7, delay: 3.3, duration: 4.2 },
  {
    top: 43,
    left: 6.5,
    size: 11,
    tone: 'blue',
    opacity: 0.6,
    delay: 0.4,
    duration: 5.6,
    shape: 'sparkle',
  },
  { top: 44.5, left: 96.5, size: 12, tone: 'pink', opacity: 0.56, delay: 2, duration: 6.3 },
  { top: 46.5, left: 2, size: 9, tone: 'pink', opacity: 0.66, delay: 3.8, duration: 4.7 },
  { top: 48, left: 92.5, size: 10, tone: 'blue', opacity: 0.64, delay: 1, duration: 5.4 },
  { top: 50, left: 7.5, size: 13, tone: 'blue', opacity: 0.52, delay: 2.5, duration: 5.1 },
  { top: 51.5, left: 95, size: 8, tone: 'pink', opacity: 0.7, delay: 4.6, duration: 4.9 },
  { top: 53.5, left: 3.5, size: 10, tone: 'pink', opacity: 0.6, delay: 0.7, duration: 5.9 },
  {
    top: 55,
    left: 90,
    size: 14,
    tone: 'blue',
    opacity: 0.5,
    delay: 3.6,
    duration: 6,
    shape: 'sparkle',
  },
  { top: 57, left: 6, size: 8, tone: 'blue', opacity: 0.72, delay: 1.5, duration: 4.4 },
  { top: 58.5, left: 97, size: 11, tone: 'pink', opacity: 0.58, delay: 2.7, duration: 5.7 },
  { top: 60.5, left: 2.5, size: 12, tone: 'pink', opacity: 0.54, delay: 4, duration: 5.2 },
  { top: 62, left: 93, size: 9, tone: 'blue', opacity: 0.68, delay: 0.6, duration: 4.8 },
  { top: 64, left: 7, size: 16, tone: 'blue', opacity: 0.48, delay: 2.1, duration: 6.5 },
  { top: 65.5, left: 95.5, size: 8, tone: 'pink', opacity: 0.74, delay: 3, duration: 4.6 },
  { top: 67.5, left: 3, size: 10, tone: 'pink', opacity: 0.62, delay: 1.8, duration: 5.5 },
  {
    top: 69,
    left: 91,
    size: 13,
    tone: 'blue',
    opacity: 0.55,
    delay: 4.3,
    duration: 5,
    shape: 'sparkle',
  },
  { top: 71, left: 6.5, size: 9, tone: 'blue', opacity: 0.7, delay: 0.9, duration: 4.3 },
  { top: 72.5, left: 96, size: 12, tone: 'pink', opacity: 0.56, delay: 2.3, duration: 6.2 },
  { top: 74.5, left: 2, size: 8, tone: 'pink', opacity: 0.68, delay: 3.5, duration: 4.7 },
  { top: 76, left: 92.5, size: 11, tone: 'blue', opacity: 0.6, delay: 1.2, duration: 5.8 },
  { top: 78, left: 7.5, size: 14, tone: 'blue', opacity: 0.5, delay: 4.5, duration: 5.3 },
  { top: 79.5, left: 95, size: 9, tone: 'pink', opacity: 0.7, delay: 2.9, duration: 4.5 },
  { top: 81.5, left: 3.5, size: 10, tone: 'pink', opacity: 0.6, delay: 0.5, duration: 6 },
  { top: 83, left: 90.5, size: 8, tone: 'blue', opacity: 0.72, delay: 3.7, duration: 4.9 },
  { top: 85, left: 6, size: 13, tone: 'blue', opacity: 0.52, delay: 1.6, duration: 5.6 },
  { top: 86.5, left: 97, size: 10, tone: 'pink', opacity: 0.64, delay: 4.1, duration: 5.1 },
  { top: 88.5, left: 2.5, size: 9, tone: 'pink', opacity: 0.66, delay: 2.2, duration: 4.6 },
  {
    top: 90,
    left: 93.5,
    size: 12,
    tone: 'blue',
    opacity: 0.54,
    delay: 0.8,
    duration: 6.1,
    shape: 'sparkle',
  },
  { top: 92, left: 7, size: 11, tone: 'blue', opacity: 0.62, delay: 3.2, duration: 5 },
  { top: 93.5, left: 95.5, size: 8, tone: 'pink', opacity: 0.72, delay: 1.9, duration: 4.4 },
  { top: 95.5, left: 3, size: 15, tone: 'pink', opacity: 0.5, delay: 4.4, duration: 5.7 },
  { top: 97, left: 91, size: 9, tone: 'blue', opacity: 0.68, delay: 2.6, duration: 4.8 },
  // Segunda capa, más densa y con destellos: la lámina se siente cielo, no marco.
  { top: 3, left: 89.5, size: 10, tone: 'blue', opacity: 0.62, delay: 2.1, duration: 5.3 },
  {
    top: 7.5,
    left: 3.5,
    size: 12,
    tone: 'pink',
    opacity: 0.56,
    delay: 0.9,
    duration: 6,
    shape: 'sparkle',
  },
  { top: 12, left: 92, size: 7, tone: 'pink', opacity: 0.7, delay: 3.2, duration: 4.8 },
  { top: 14.5, left: 9, size: 15, tone: 'blue', opacity: 0.5, delay: 1.4, duration: 6.3 },
  { top: 19, left: 96, size: 8, tone: 'blue', opacity: 0.66, delay: 4.1, duration: 5.2 },
  { top: 24, left: 1.5, size: 9, tone: 'pink', opacity: 0.64, delay: 2.7, duration: 4.5 },
  {
    top: 28.5,
    left: 93.5,
    size: 16,
    tone: 'blue',
    opacity: 0.48,
    delay: 0.4,
    duration: 6.6,
    shape: 'sparkle',
  },
  { top: 33, left: 5, size: 8, tone: 'blue', opacity: 0.72, delay: 3.8, duration: 4.2 },
  { top: 38, left: 95, size: 12, tone: 'pink', opacity: 0.54, delay: 1.9, duration: 5.9 },
  { top: 42.5, left: 2, size: 10, tone: 'blue', opacity: 0.6, delay: 4.6, duration: 5.1 },
  { top: 47.5, left: 91, size: 7, tone: 'pink', opacity: 0.74, delay: 0.7, duration: 4.4 },
  {
    top: 52.5,
    left: 8,
    size: 13,
    tone: 'blue',
    opacity: 0.52,
    delay: 2.3,
    duration: 6.2,
    shape: 'sparkle',
  },
  { top: 57, left: 96.5, size: 9, tone: 'blue', opacity: 0.68, delay: 3.9, duration: 4.6 },
  { top: 61.5, left: 3, size: 8, tone: 'pink', opacity: 0.7, delay: 1.1, duration: 5.7 },
  { top: 66.5, left: 94, size: 14, tone: 'pink', opacity: 0.5, delay: 4.4, duration: 6 },
  { top: 73.5, left: 7, size: 6, tone: 'blue', opacity: 0.74, delay: 2.6, duration: 4.3 },
  { top: 77.5, left: 96, size: 11, tone: 'blue', opacity: 0.58, delay: 0.3, duration: 5.4 },
  { top: 82, left: 4.5, size: 9, tone: 'pink', opacity: 0.66, delay: 3.4, duration: 5 },
  {
    top: 87,
    left: 92,
    size: 15,
    tone: 'blue',
    opacity: 0.46,
    delay: 1.6,
    duration: 6.4,
    shape: 'sparkle',
  },
  { top: 91, left: 3, size: 7, tone: 'pink', opacity: 0.7, delay: 4.8, duration: 4.7 },
];

const STAR_PATH =
  'M12 1.8l3.02 6.52 7.14.73-5.33 4.79 1.51 7.03L12 17.24l-6.34 3.63 1.51-7.03L1.84 9.05l7.14-.73L12 1.8z';

export const SPARKLE_PATH =
  'M12 1.4c.62 4.75 3.85 7.98 8.6 8.6-4.75.62-7.98 3.85-8.6 8.6-.62-4.75-3.85-7.98-8.6-8.6 4.75-.62 7.98-3.85 8.6-8.6z';

export function StarField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-[640px] -translate-x-1/2 overflow-hidden"
    >
      {STARS.map((star, index) => {
        const style = {
          top: `${star.top}%`,
          left: `${star.left}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          animationDelay: `${star.delay}s`,
          animationDuration: `${star.duration}s`,
          '--star-opacity': star.opacity,
        } as CSSProperties;

        return (
          <svg
            key={`${star.top}-${star.left}-${index}`}
            viewBox="0 0 24 24"
            focusable="false"
            className={
              star.shape === 'sparkle'
                ? `sparkle-twinkle absolute ${star.tone === 'pink' ? 'text-star-pink' : 'text-star-blue'}`
                : `star-twinkle absolute ${star.tone === 'pink' ? 'text-star-pink' : 'text-star-blue'}`
            }
            style={style}
          >
            <path d={star.shape === 'sparkle' ? SPARKLE_PATH : STAR_PATH} fill="currentColor" />
          </svg>
        );
      })}
    </div>
  );
}
