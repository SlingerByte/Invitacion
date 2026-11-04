import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { event } from '@/config/event';
import { StarField } from '@/components/StarField';
import { Clouds, StarRain } from '@/components/SkyWeather';
import { VoteSection } from '@/sections/VoteSection';
import { RevealSection } from '@/sections/RevealSection';
import { mapHref } from '@/lib/event-links';

const EASE = [0.22, 1, 0.36, 1] as const;

interface RabbitProps {
  side: 'left' | 'right';
}

function Rabbit({ side }: RabbitProps) {
  const isLeft = side === 'left';

  return (
    <div aria-hidden="true" className="relative w-[44%] max-w-[140px]">
      <img
        src={isLeft ? '/assets/conejo-izq.png' : '/assets/conejo-der.png'}
        alt=""
        width={600}
        height={1200}
        draggable={false}
        decoding="async"
        fetchPriority="high"
        className="balloon-float relative z-10 h-auto w-full select-none"
        style={{
          animationDuration: isLeft ? '5.1s' : '5.7s',
          animationDelay: isLeft ? '-0.7s' : '-2.3s',
        }}
      />

      {/* Sombra de contacto: ellipse bajo las patas, no bajo el lienzo entero. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 20"
        className={`text-ink pointer-events-none absolute bottom-[10px] z-0 aspect-[5/1] w-[38%] -translate-x-1/2 ${
          isLeft ? 'left-[46%]' : 'left-[58%]'
        }`}
      >
        <defs>
          <radialGradient id={`rabbit-shadow-${side}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="60%" stopColor="currentColor" stopOpacity="0.11" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="10" rx="49" ry="8" fill={`url(#rabbit-shadow-${side})`} />
      </svg>
    </div>
  );
}

export function Invitation() {
  const reduced = useReducedMotion() ?? false;
  const { scrollY } = useScroll();

  // Parallax corto: la lámina se mueve en capas, no se desarma.
  const rabbitsY = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -48]);
  const titleY = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -20]);
  const starsY = useTransform(scrollY, [0, 700], [0, reduced ? 0 : 56]);

  const [firstName, secondName] = event.parents.names;
  const parentsLabel = `${firstName} y ${secondName}`;
  const map = mapHref();
  const dressCode = event.celebration.dressCode.trim();

  const reveal = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.85, ease: EASE, delay },
  });

  return (
    <main
      id="invitacion"
      tabIndex={-1}
      className="bg-paper relative isolate min-h-[100svh] overflow-hidden outline-none"
    >
      <Clouds />

      <motion.div
        aria-hidden="true"
        style={{ y: starsY }}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <StarField />
      </motion.div>

      <StarRain />

      <div className="relative mx-auto w-full max-w-[420px] px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-16">
        <section aria-labelledby="invitation-title">
          <motion.div style={{ y: rabbitsY }} className="mx-auto w-full max-w-[360px]">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.15, ease: EASE, delay: 0.05 }}
              className="flex items-start justify-between gap-2"
            >
              <Rabbit side="left" />
              <Rabbit side="right" />
            </motion.div>
          </motion.div>

          {/* El título se mete entre los cuerpos, no queda a los pies. */}
          <motion.div style={{ y: titleY }} className="relative z-20 -mt-[130px]">
            <h1 id="invitation-title" className="sr-only">
              {parentsLabel} te invitan a la revelación de género
            </h1>

            <motion.div
              initial={reduced ? false : { y: 18, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 0.95, ease: EASE, delay: 0.18 }}
              className="font-display relative z-10 mx-auto flex w-fit flex-col items-center leading-[0.82]"
            >
              <span className="text-blue-display text-[58px]">Niño</span>
              <span className="relative my-1 block h-2.5 w-2.5">
                <span className="text-gold-deep absolute top-[50%] left-[calc(50%+40px)] -translate-x-1/2 -translate-y-1/2 text-[40px] leading-none">
                  o
                </span>
              </span>
              <span className="text-rose-display text-[58px]">Niña</span>
            </motion.div>
          </motion.div>

          <motion.p
            {...reveal(0.22)}
            className="text-blue-ink mx-auto mt-7 max-w-[320px] text-center text-[18px] leading-[1.65] tracking-[0.04em]"
          >
            {event.copy.invitation.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </motion.p>

          <motion.p
            {...reveal(0.32)}
            className="font-display text-rose-deep mt-5 text-center text-[40px] leading-none tracking-normal"
          >
            {parentsLabel}
          </motion.p>

          <motion.div {...reveal(0.42)} className="mx-auto mt-8 max-w-[330px] text-center">
            <div className="mb-6 flex items-center justify-center gap-2.5" aria-hidden="true">
              <span className="bg-gold/70 h-px w-9" />
              <span className="bg-gold size-1.5 rounded-full" />
              <span className="bg-gold/70 h-px w-9" />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-blue-ink text-[17px] leading-snug font-medium tracking-[0.04em]">
                  {event.celebration.dateLabel}
                </p>
                <p className="text-blue-deep mt-1 text-[15px] tracking-[0.04em]">
                  {event.celebration.timeLabel}
                </p>
              </div>

              <div>
                <p className="text-blue-ink text-[16px] leading-snug font-medium tracking-[0.04em]">
                  {event.venue.name}
                </p>
                <p className="text-blue-deep mt-1 text-[14.5px] leading-relaxed tracking-[0.04em]">
                  {map ? (
                    <a
                      href={map}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Abrir ${event.venue.address} en Google Maps`}
                      className="decoration-blue/50 hover:text-blue-ink hover:decoration-gold underline decoration-1 underline-offset-4 transition-colors"
                    >
                      {event.venue.address}
                    </a>
                  ) : (
                    event.venue.address
                  )}
                </p>
              </div>

              {dressCode && (
                <div className="pt-1">
                  <p className="text-blue-deep text-[12px] font-medium tracking-[0.18em] uppercase">
                    Código de vestimenta
                  </p>
                  <div
                    className="mt-2.5 flex items-center justify-center gap-2"
                    aria-hidden="true"
                  >
                    <span className="bg-paper border-blue-deep/40 size-3.5 rounded-full border" />
                    <span className="bg-beige border-blue-deep/40 size-3.5 rounded-full border" />
                  </div>
                  <p className="text-blue-ink mt-2 text-[15px] font-medium tracking-[0.04em] first-letter:uppercase">
                    {dressCode}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <VoteSection />

          <RevealSection />

          <motion.p
            {...reveal(0.2)}
            className="font-display text-rose-deep mt-14 text-center text-[30px] leading-none"
          >
            Con cariño, {parentsLabel}
          </motion.p>
        </section>
      </div>
    </main>
  );
}
