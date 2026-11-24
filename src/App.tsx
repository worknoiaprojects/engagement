import { CinematicScroller } from './components/CinematicScroller';

export default function App() {
  return (
    <main className="bg-[#0b0314] min-h-screen text-[#2b0b3f] flex justify-center overflow-x-hidden">
      {/* 
        Mobile-Locked Invitation Format
        Preserves 100% vertical mobile aspect ratio (max-w-[440px]) on desktop/tablet,
        while stretching to full 100% edge-to-edge on mobile phones (down to 320px).
      */}
      <div className="w-full max-w-[440px] min-h-screen relative shadow-[0_0_80px_rgba(0,0,0,0.85)] bg-white overflow-x-hidden">
        <CinematicScroller />
      </div>
    </main>
  );
}
