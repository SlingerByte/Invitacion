import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, RefreshCw } from 'lucide-react';
import { event } from '@/config/event';
import { useVote, type VotePhase } from '@/hooks/useVote';
import { ConfettiBurst } from '@/components/ConfettiBurst';
import { VoteResults } from '@/components/VoteResults';
import { cn } from '@/lib/cn';
import { VOTE_NAME_MAX_LENGTH, type Prediction } from '@shared/vote-contract';

const EASE = [0.22, 1, 0.36, 1] as const;

const TONE: Record<
  Prediction,
  { label: string; button: string; cardBorder: string; fieldBorder: string }
> = {
  girl: {
    label: 'Niña',
    button: 'bg-pink text-pink-ink',
    cardBorder: 'border-pink/60',
    fieldBorder: 'border-rose-deep',
  },
  boy: {
    label: 'Niño',
    button: 'bg-sky text-sky-ink',
    cardBorder: 'border-sky/70',
    fieldBorder: 'border-blue-deep',
  },
};

function BalloonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 32"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      <path
        d="M12 1.6c5.1 0 9.2 3.8 9.2 8.5 0 4.6-4.1 8.4-9.2 8.4S2.8 14.7 2.8 10.1c0-4.7 4.1-8.5 9.2-8.5Z"
        fill="currentColor"
      />
      <path d="M12 18.5 10.3 21h3.4L12 18.5Z" fill="currentColor" />
      <path
        d="M12 21c-.8 3.4 1.6 5.8 4 8.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function resultsSentence(phase: Extract<VotePhase, { kind: 'recorded' | 'closed' }>): string {
  const results = phase.results;
  if (!results || results.total === 0) return '';
  return ` Resultados: ${results.total} ${
    results.total === 1 ? 'predicción' : 'predicciones'
  }, niña ${results.girl}, niño ${results.boy}.`;
}

function phaseAnnouncement(phase: VotePhase): string {
  switch (phase.kind) {
    case 'loading':
      return 'Consultando el estado de la votación.';
    case 'open':
      return 'La votación está abierta. Elige niña o niño para dejar tu predicción.';
    case 'selected':
      return `Predicción elegida: ${TONE[phase.prediction].label}. Escribe tu nombre y confirma tu voto.`;
    case 'submitting':
      return 'Registrando tu voto.';
    case 'recorded':
      return phase.already
        ? `Ya habías dejado tu predicción: ${TONE[phase.prediction].label}.${resultsSentence(phase)}`
        : `Tu predicción quedó registrada: ${TONE[phase.prediction].label}.${resultsSentence(phase)}`;
    case 'closed':
      return `La votación está cerrada.${resultsSentence(phase)}`;
    case 'error':
      return 'La votación no está disponible en este momento.';
  }
}

export function VoteSection() {
  const reduced = useReducedMotion() ?? false;
  const {
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
  } = useVote();

  const confirmationRef = useRef<HTMLDivElement>(null);
  const wasSubmitting = useRef(false);

  // Al registrar, el formulario desaparece: el foco viaja a la confirmación
  // para que el teclado y el lector no vuelvan al principio de la página.
  useEffect(() => {
    if (phase.kind === 'submitting') {
      wasSubmitting.current = true;
      return;
    }
    if (phase.kind === 'recorded' && wasSubmitting.current) {
      wasSubmitting.current = false;
      confirmationRef.current?.focus();
    }
  }, [phase.kind]);

  const selected =
    phase.kind === 'selected' || phase.kind === 'submitting'
      ? phase.prediction
      : phase.kind === 'recorded'
        ? phase.prediction
        : null;
  const showChoices =
    phase.kind === 'open' || phase.kind === 'selected' || phase.kind === 'submitting';
  const showForm = phase.kind === 'selected' || phase.kind === 'submitting';
  const busy = phase.kind === 'submitting';

  return (
    <section id="votacion" aria-labelledby="vote-title" className="mt-12">
      <motion.h2
        id="vote-title"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.7 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="font-display text-rose-deep text-center text-[27px] leading-none"
      >
        {event.copy.invitation.voteQuestion}
      </motion.h2>

      <p className="sr-only" role="status" aria-live="polite">
        {phaseAnnouncement(phase)}
      </p>

      {phase.kind === 'open' && (
        <p className="text-blue-deep mt-2 text-center text-[12.5px] tracking-[0.04em]">
          Elige una y escribe tu nombre.
        </p>
      )}

      {showChoices && (
        <>
          <div className="relative mt-5">
            <div className="flex justify-center gap-3">
              {(['boy', 'girl'] as const).map((prediction) => {
                const isSelected = selected === prediction;
                return (
                  <motion.button
                    key={prediction}
                    type="button"
                    onClick={() => choose(prediction)}
                    disabled={busy}
                    aria-pressed={isSelected}
                    animate={
                      isSelected && !reduced ? { scale: 1.05, y: -2 } : { scale: 1, y: 0 }
                    }
                    transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                    {...(isSelected
                      ? {
                          style: {
                            boxShadow: `0 12px 22px -14px var(--color-${
                              prediction === 'girl' ? 'pink' : 'sky'
                            })`,
                          },
                        }
                      : {})}
                    className={cn(
                      'relative flex h-[50px] max-w-[146px] flex-1 items-center justify-center overflow-visible rounded-full px-4 text-[14.5px] font-medium tracking-[0.04em] shadow-[0_8px_18px_-16px_rgba(43,46,42,0.35)] transition-shadow duration-300',
                      TONE[prediction].button,
                      isSelected && 'ring-gold-deep ring-offset-paper ring-2 ring-offset-2',
                      busy && 'cursor-wait opacity-80',
                    )}
                  >
                    {isSelected && burst > 0 && (
                      <ConfettiBurst
                        key={`${prediction}-${burst}`}
                        prediction={prediction}
                        className="top-1/2 left-[22px]"
                      />
                    )}
                    {!reduced && isSelected && burst > 0 && (
                      <motion.span
                        key={`flash-${prediction}-${burst}`}
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-[22px] size-4 rounded-full border-2 border-white/90"
                        initial={{ scale: 0.35, opacity: 0.9 }}
                        animate={{ scale: 2.8, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                      />
                    )}
                    <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
                      <motion.span
                        aria-hidden="true"
                        className="block"
                        animate={
                          !reduced && isSelected
                            ? {
                                scale: [1, 1.35, 0.02],
                                opacity: [1, 1, 0],
                                rotate: [0, -6, 4],
                              }
                            : { scale: 1, opacity: 1, rotate: 0 }
                        }
                        transition={{ duration: 0.32, times: [0, 0.45, 1], ease: 'easeIn' }}
                      >
                        <BalloonIcon className="h-5 w-[15px]" />
                      </motion.span>
                    </span>
                    {TONE[prediction].label}
                    {isSelected && (
                      <Check
                        aria-hidden="true"
                        className="absolute right-3.5 size-3.5"
                        strokeWidth={2.4}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {showForm && selected && (
              <motion.form
                key="name-form"
                aria-busy={busy}
                onSubmit={(formEvent) => {
                  formEvent.preventDefault();
                  void submit();
                }}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                {...(reduced ? {} : { exit: { opacity: 0, y: 8 } })}
                transition={{ duration: 0.45, ease: EASE }}
                className="mx-auto mt-6 w-full max-w-[300px]"
              >
                <p className="text-blue-deep mb-3 text-center text-[13px]">
                  Vas a votar por{' '}
                  <span
                    className={cn(
                      'font-medium',
                      selected === 'girl' ? 'text-rose-ink' : 'text-blue-ink',
                    )}
                  >
                    {TONE[selected].label}
                  </span>
                  .
                </p>
                <label
                  htmlFor="guest-name"
                  className="text-blue-ink block text-center text-[13px] font-medium tracking-[0.06em]"
                >
                  {event.copy.invitation.nameLabel}
                </label>
                <input
                  id="guest-name"
                  name="guest-name"
                  type="text"
                  value={name}
                  onChange={(inputEvent) => changeName(inputEvent.target.value)}
                  maxLength={VOTE_NAME_MAX_LENGTH}
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="done"
                  placeholder={event.copy.invitation.namePlaceholder}
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? 'guest-name-error' : 'guest-name-help'}
                  className={cn(
                    'text-blue-ink caret-blue-ink placeholder:text-blue-deep mt-2 h-12 w-full rounded-full border bg-white px-4 text-center text-[15px]',
                    selected === 'girl' ? TONE.girl.fieldBorder : TONE.boy.fieldBorder,
                  )}
                />
                <p
                  id="guest-name-help"
                  className={cn(
                    'text-blue-deep mt-2 text-center text-[12px] leading-relaxed',
                    nameError && 'sr-only',
                  )}
                >
                  {event.copy.invitation.nameHelp}
                </p>
                {nameError && (
                  <p
                    id="guest-name-error"
                    role="alert"
                    className="text-rose-ink mt-2 text-center text-[13px] leading-relaxed"
                  >
                    {nameError}
                  </p>
                )}
                {submitError && (
                  <p
                    role="alert"
                    className="text-rose-ink mt-2 text-center text-[13px] leading-relaxed"
                  >
                    {submitError}
                  </p>
                )}
                <motion.button
                  type="submit"
                  disabled={busy}
                  {...(reduced ? {} : { whileTap: { scale: 0.98 } })}
                  className={cn(
                    'mt-4 flex h-12 w-full items-center justify-center rounded-full text-[15px] font-medium tracking-[0.04em] shadow-[0_12px_24px_-14px_rgba(43,46,42,0.45)]',
                    TONE[selected].button,
                    busy && 'cursor-wait opacity-75',
                  )}
                >
                  {busy ? 'Registrando…' : `Confirmar ${TONE[selected].label}`}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </>
      )}

      <>
        {phase.kind === 'loading' && (
          <motion.div
            key="loading"
            role="status"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-blue-ink mt-6 flex items-center justify-center gap-2.5 text-[13px]"
          >
            <span className="bg-gold size-1.5 animate-pulse rounded-full" aria-hidden="true" />
            Consultando la votación…
          </motion.div>
        )}

        {phase.kind === 'error' && (
          <motion.div
            key="error"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-6 max-w-[300px] text-center"
          >
            <p className="text-blue-ink text-[13.5px] leading-relaxed">
              No pudimos cargar la votación. Inténtalo de nuevo en un momento.
            </p>
            <button
              type="button"
              onClick={retry}
              className="border-blue-deep text-blue-ink hover:border-gold mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-[13px] font-medium tracking-[0.04em] transition-colors"
            >
              <RefreshCw aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
              Reintentar
            </button>
          </motion.div>
        )}

        {phase.kind === 'recorded' && (
          <motion.div
            key="recorded"
            ref={confirmationRef}
            tabIndex={-1}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-6 w-full max-w-[320px] outline-none"
          >
            <div
              className={cn(
                'rounded-2xl border bg-white px-5 py-5 text-center',
                TONE[phase.prediction].cardBorder,
              )}
            >
              <span
                className={cn(
                  'mx-auto flex size-9 items-center justify-center rounded-full',
                  TONE[phase.prediction].button,
                )}
                aria-hidden="true"
              >
                <Check className="size-4.5" strokeWidth={2.4} />
              </span>
              <p className="text-blue-ink mt-3 text-[15px] font-medium">
                {phase.already
                  ? 'Ya habías dejado tu predicción'
                  : '¡Gracias por tu predicción!'}
              </p>
              <p className="text-blue-deep mt-1.5 text-[13px]">
                Elegiste{' '}
                <span
                  className={cn(
                    'font-medium',
                    phase.prediction === 'girl' ? 'text-rose-ink' : 'text-blue-ink',
                  )}
                >
                  {TONE[phase.prediction].label}
                </span>
                .
              </p>
              <p className="text-blue-deep mt-3 text-[12px] leading-relaxed">
                {devMode
                  ? 'Modo desarrollo: puedes reiniciar la prueba y votar otra vez.'
                  : 'Desde este navegador ya no se puede registrar otro voto.'}
              </p>
              {devMode && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => void restartDev()}
                    className="border-blue-deep text-blue-ink hover:border-gold focus-visible:outline-ink inline-flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-[12.5px] font-medium tracking-[0.04em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <RefreshCw aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
                    Reiniciar prueba
                  </button>
                  {devResetError && (
                    <p role="alert" className="text-rose-ink mt-2 text-[12px]">
                      {devResetError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <VoteResults results={phase.results} className="mt-7" />
          </motion.div>
        )}

        {phase.kind === 'closed' && (
          <motion.div
            key="closed"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-6 w-full max-w-[320px] text-center"
          >
            <p className="text-blue-ink text-[15px] font-medium">La votación está cerrada.</p>
            <p className="text-blue-deep mt-1.5 text-[12.5px] leading-relaxed">
              Gracias por acompañarnos. Estas son las predicciones registradas.
            </p>
            <VoteResults results={phase.results} className="mt-7" />
          </motion.div>
        )}
      </>
    </section>
  );
}
