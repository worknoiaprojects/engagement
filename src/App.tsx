import { CinematicScroller } from './components/CinematicScroller';

export default function App() {
  return (
    <main className="bg-[#0b0314] min-h-screen text-[#2b0b3f]">
      {/* 
        Cinematic Wedding Scroller
        Centered on desktop (max-w-[440px]), 100% full-width on mobile.
        Preserves natural document flow for GSAP ScrollTrigger and Lenis smooth scrolling.
      */}
      <CinematicScroller />
    </main>
  );
}
