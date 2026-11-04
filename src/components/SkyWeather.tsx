import type { CSSProperties } from 'react';
import { SPARKLE_PATH } from './StarField';

interface Cloud {
  top: number;
  left: number;
  width: number;
  tone: 'blue' | 'rose';
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
  shape: 0 | 1 | 2;
}

/** Formas de nube dibujadas a mano: tres siluetas, ninguna idéntica. */
const CLOUD_PATHS = [
  'M42 72c-16 0-28-11-28-24 0-14 12-25 28-25 4-15 17-25 33-25 18 0 32 12 35 29 4-2 8-3 13-3 14 0 25 10 25 23 0 13-11 25-27 25H42Z',
  'M24 70c-12 0-21-8-21-18 0-11 9-19 21-19 3-12 13-20 26-20 14 0 25 9 28 22 3-1 6-2 10-2 12 0 21 8 21 18 0 11-9 19-22 19H24Z',
  'M34 68c-14 0-24-9-24-20 0-12 10-21 24-21 4-12 15-19 28-19 15 0 27 11 29 25 3-1 7-2 10-2 13 0 23 8 23 18 0 11-10 19-24 19H34Z',
] as const;

const CLOUDS: Cloud[] = [
  {
    top: 5,
    left: -14,
    width: 250,
    tone: 'blue',
    opacity: 0.55,
    duration: 68,
    delay: -6,
    drift: 28,
    shape: 0,
  },
  {
    top: 21,
    left: 66,
    width: 180,
    tone: 'rose',
    opacity: 0.36,
    duration: 76,
    delay: -34,
    drift: -20,
    shape: 1,
  },
  {
    top: 48,
    left: -18,
    width: 220,
    tone: 'blue',
    opacity: 0.38,
    duration: 84,
    delay: -18,
    drift: 36,
    shape: 2,
  },
  {
    top: 76,
    left: 58,
    width: 210,
    tone: 'rose',
    opacity: 0.3,
    duration: 72,
    delay: -48,
    drift: -26,
    shape: 0,
  },
];

interface RainStar {
  left: number;
  size: number;
  tone: 'pink' | 'blue';
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
}

/** PRNG determinista: la lluvia es distinta en cada carga, pero no parpadea. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const RAIN_COUNT = 20;
const random = seeded(15112026);
const RAIN: RainStar[] = Array.from({ length: RAIN_COUNT }, (_, index) => {
  const duration = 18 + random() * 10;
  const band = (index + 0.5) / RAIN_COUNT;
  return {
    left: 2 + band * 96 + (random() - 0.5) * 3,
    size: 4 + random() * 3.5,
    tone: random() > 0.5 ? 'pink' : 'blue',
    opacity: 0.35 + random() * 0.3,
    duration,
    delay: random() * 8,
    drift: -14 + random() * 28,
  };
});

/**
 * Nubes quietas que se mecen y una lluvia de estrellas de pantalla completa.
 * Ambas capas son decorativas, no reciben punteros y se apagan con movimiento
 * reducido.
 */
export function Clouds() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {CLOUDS.map((cloud, index) => (
        <svg
          key={`${cloud.top}-${cloud.left}-${index}`}
          viewBox="0 0 220 96"
          focusable="false"
          className={`cloud-drift absolute h-auto blur-[1.2px] ${
            cloud.tone === 'blue' ? 'text-cloud' : 'text-cloud-rose'
          }`}
          style={
            {
              top: `${cloud.top}%`,
              left: `${cloud.left}%`,
              width: `${cloud.width}px`,
              opacity: cloud.opacity,
              animationDuration: `${cloud.duration}s`,
              animationDelay: `${cloud.delay}s`,
              '--cloud-drift': `${cloud.drift}px`,
            } as CSSProperties
          }
        >
          <path d={CLOUD_PATHS[cloud.shape]} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}

export function StarRain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden"
    >
      {RAIN.map((star, index) => (
        <svg
          key={`${star.left}-${star.size}-${index}`}
          viewBox="0 0 24 24"
          focusable="false"
          className={`star-rain absolute ${
            star.tone === 'pink' ? 'text-star-pink' : 'text-star-blue'
          }`}
          style={
            {
              left: `${star.left}%`,
              top: 0,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              '--rain-opacity': star.opacity,
              '--rain-drift': `${star.drift}px`,
            } as CSSProperties
          }
        >
          <path d={SPARKLE_PATH} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
