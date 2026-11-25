import { CinematicScroller } from './components/CinematicScroller';

export default function App() {
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
