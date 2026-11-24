import { CinematicScroller } from './components/CinematicScroller';

export default function App() {
  return (
    <main className="bg-[#0b0314] min-h-screen text-[#2b0b3f] flex items-center justify-center overflow-x-hidden">
      {/* 
        Dynamic Responsive Mobile-Locked Container
        Dynamically adapts width and height with 9:16 aspect ratio up to 100dvh,
        ensuring 100% full visibility with ZERO cut-off on any mobile or desktop device.
      */}
      <div
        style={{
          maxWidth: 'min(440px, 100vw, calc(100dvh * 9 / 16))',
          height: 'min(100dvh, calc(100vw * 16 / 9))',
        }}
        className="w-full relative shadow-[0_0_80px_rgba(0,0,0,0.85)] bg-white overflow-hidden flex flex-col justify-center"
      >
        <CinematicScroller />
      </div>
    </main>
  );
}
