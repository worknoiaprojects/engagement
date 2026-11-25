import { CinematicScroller } from './components/CinematicScroller';
import { RingPoster } from './components/RingPoster';

const POSTER_ROUTES = new Set(['/poster', '/rings', '/ring-ceremony']);

export default function App() {
  const pathname = typeof window !== 'undefined'
    ? window.location.pathname.replace(/\/+$/, '') || '/'
    : '/';

  if (POSTER_ROUTES.has(pathname.toLowerCase())) {
    return (
      <main className="bg-[#0b0314] h-[100dvh] overflow-hidden text-[#3b251b]">
        <RingPoster />
      </main>
    );
  }

  return (
    <main className="bg-[#0b0314] h-[100dvh] overflow-hidden text-[#2b0b3f]">
      {/* 
        Cinematic Wedding Reveal
        Centered on desktop (max-w-[440px]), 100% full-width stationary viewport on mobile.
      */}
      <CinematicScroller />
    </main>
  );
}
