import React from 'react';

export const RingPoster: React.FC = () => {
  return (
    <div className="relative bg-[#0b0314] h-[100dvh] w-full overflow-hidden flex items-center justify-center p-5">
      {/* Small Centered 4:5 Editorial Poster (Matches Exact 736x920 Proportions, Not Full Screen) */}
      <div className="relative w-full max-w-[360px] aspect-[4/5] max-h-[84dvh] rounded-2xl overflow-hidden bg-[#f5efe6] shadow-[0_24px_80px_rgba(0,0,0,0.75)] select-none">
        {/* Backlit Ring Ceremony Silhouette Artwork (Exact 4:5 Natural Proportions) */}
        <img
          src="/images/ring_ceremony.jpg"
          alt="The Ring Ceremony - Suvarna & Rajesh"
          decoding="sync"
          loading="eager"
          className="w-full h-full object-cover object-center pointer-events-none select-none block"
        />

        {/* Soft Warm Ivory Top Veil (smoothly blends top edge for typography) */}
        <div
          className="absolute inset-x-0 top-0 h-[32%] pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, #f6f1ea 0%, rgba(246, 241, 234, 0.92) 30%, rgba(246, 241, 234, 0) 100%)',
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
        <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center text-center pt-7 sm:pt-8 px-5 poster-fade-in">
          {/* Ghosted Watermark Layer Behind Names */}
          <span
            aria-hidden="true"
            className="font-script text-5xl sm:text-6xl text-[#4a3226]/[0.07] leading-none select-none -mb-7 tracking-normal"
          >
            Forever
          </span>

          {/* Spaced Faded Eyebrow */}
          <p className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.36em] text-[#4a3226]/55 font-medium mb-2">
            The Ring Ceremony
          </p>

          {/* Faded Ink Couple Names */}
          <h1 className="font-heading text-2xl sm:text-3xl font-normal tracking-wide text-[#3b251b]/75 leading-tight">
            Suvarna{' '}
            <span className="font-script text-3xl sm:text-4xl text-[#6e4b3a]/65 mx-1 align-middle">
              &amp;
            </span>{' '}
            Rajesh
          </h1>

          {/* Delicate Faded Hairline Divider */}
          <div className="w-14 h-[1px] bg-gradient-to-r from-transparent via-[#4a3226]/30 to-transparent my-2.5" />

          {/* Faded Date & Venue Subtitle */}
          <p className="font-cormorant italic text-xs sm:text-sm tracking-[0.14em] text-[#4a3226]/60">
            26th November &middot; 08:00 AM &middot; Vemulawada
          </p>
        </div>

        {/* Bottom Faded Poetic Footer */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 pb-5 pt-12 px-5 flex flex-col items-center text-center pointer-events-none poster-fade-in"
          style={{
            background:
              'linear-gradient(0deg, rgba(244, 238, 230, 0.85) 0%, rgba(244, 238, 230, 0.4) 55%, rgba(244, 238, 230, 0) 100%)',
          }}
        >
          <p className="font-cormorant italic text-xs sm:text-[13px] tracking-[0.12em] text-[#3b251b]/55">
            Two hands, one promise, a lifetime together
          </p>
        </div>
      </div>
    </div>
  );
};
