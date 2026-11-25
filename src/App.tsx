import { CinematicScroller } from './components/CinematicScroller';
import { RingPoster } from './components/RingPoster';
import { NotFound } from './components/NotFound';
import { AdminWishes } from './components/AdminWishes';

const HOME_ROUTES = new Set(['/', '/index.html']);
const POSTER_ROUTES = new Set(['/poster', '/rings', '/ring-ceremony']);
const TELUGU_POSTER_ROUTES = new Set(['/telugu', '/poster-te', '/rings-te']);
const ADMIN_ROUTES = new Set(['/checkwishes']);

export default function App() {
  const pathname = typeof window !== 'undefined'
    ? (window.location.pathname.replace(/\/+$/, '') || '/').toLowerCase()
    : '/';

  if (ADMIN_ROUTES.has(pathname)) {
    return (
      <main className="bg-[#0b0314] h-[100dvh] overflow-hidden text-[#2b0b3f]">
        <AdminWishes />
      </main>
    );
  }

  if (TELUGU_POSTER_ROUTES.has(pathname)) {
    return (
      <main className="bg-[#0b0314] h-[100dvh] overflow-hidden text-[#3b251b]">
        <RingPoster language="te" />
      </main>
    );
  }

  if (POSTER_ROUTES.has(pathname)) {
    return (
      <main className="bg-[#0b0314] h-[100dvh] overflow-hidden text-[#3b251b]">
        <RingPoster language="en" />
      </main>
    );
  }

  if (HOME_ROUTES.has(pathname)) {
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

  return (
    <main className="bg-[#0b0314] h-[100dvh] overflow-hidden text-[#2b0b3f]">
      <NotFound />
    </main>
  );
}
