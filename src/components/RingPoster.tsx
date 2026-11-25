import React from 'react';

export const RingPoster: React.FC = () => {
  return (
    <div className="relative bg-[#0b0314] h-[100dvh] w-full overflow-hidden flex items-center justify-center">
      {/* Mobile-Locked Editorial Poster Frame */}
      <div className="relative w-full max-w-[440px] h-[100dvh] overflow-hidden bg-[#f5efe6] shadow-[0_0_80px_rgba(0,0,0,0.85)] select-none mx-auto">
        {/* Backlit Ring Ceremony Silhouette Artwork */}
        <img
          src="/images/ring_ceremony.jpg"
          alt="The Ring Ceremony - Suvarna & Rajesh"
          decoding="sync"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.06] translate-y-[2%] pointer-events-none select-none"
        />

        {/* Soft Warm Ivory Top Veil (smoothly blends out top edge into editorial canvas) */}
        <div
          className="absolute inset-x-0 top-0 h-[38%] pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, #f6f1ea 0%, rgba(246, 241, 234, 0.92) 34%, rgba(246, 241, 234, 0) 100%)',
          }}
        />

        {/* Subtle Film Grain / Warm Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 52%, transparent 55%, rgba(42, 26, 18, 0.14) 100%)',
          }}
        />

        {/* Upper Faded Editorial Typography */}
        <div className="relative z-10 flex flex-col items-center text-center pt-[11vh] px-6 poster-fade-in">
          {/* Ghosted Watermark Layer Behind Names */}
          <span
            aria-hidden="true"
            className="font-script text-6xl sm:text-7xl text-[#4a3226]/[0.07] leading-none select-none -mb-9 tracking-normal"
          >
            Forever
          </span>

          {/* Spaced Faded Eyebrow */}
          <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.38em] text-[#4a3226]/55 font-medium mb-3">
            The Ring Ceremony
          </p>

          {/* Faded Ink Couple Names */}
          <h1 className="font-heading text-3xl sm:text-4xl font-normal tracking-wide text-[#3b251b]/75 leading-tight">
            Suvarna{' '}
            <span className="font-script text-4xl sm:text-5xl text-[#6e4b3a]/65 mx-1 align-middle">
              &amp;
            </span>{' '}
            Rajesh
          </h1>

          {/* Delicate Faded Hairline Divider */}
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#4a3226]/30 to-transparent my-3.5" />

          {/* Faded Date & Venue Subtitle */}
          <p className="font-cormorant italic text-sm sm:text-base tracking-[0.14em] text-[#4a3226]/60">
            26th November &middot; 08:00 AM &middot; Vemulawada
          </p>
        </div>

        {/* Bottom Faded Poetic Footer */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 pb-8 pt-16 px-6 flex flex-col items-center text-center pointer-events-none poster-fade-in"
          style={{
            background:
              'linear-gradient(0deg, rgba(244, 238, 230, 0.88) 0%, rgba(244, 238, 230, 0.45) 55%, rgba(244, 238, 230, 0) 100%)',
          }}
        >
          <p className="font-cormorant italic text-sm sm:text-[15px] tracking-[0.12em] text-[#3b251b]/55">
            Two hands, one promise, a lifetime together
          </p>
        </div>
      </div>
    </div>
  );
};
