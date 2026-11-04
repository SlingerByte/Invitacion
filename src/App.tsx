import { Invitation } from './sections/Invitation';

export default function App() {
  return (
    <>
      <a
        href="#votacion"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2 focus:text-[0.7rem] focus:tracking-[0.2em] focus:text-paper focus:uppercase"
      >
        Saltar a la votación
      </a>
      <Invitation />
    </>
  );
}
