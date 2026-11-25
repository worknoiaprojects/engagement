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

        {/* Upper Faded Editorial Typography (Single-Line, Clean Above Hands) */}
        <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center text-center pt-5 sm:pt-6 px-4 poster-fade-in">
          {/* Ghosted Watermark Layer Behind Names */}
          <span
            aria-hidden="true"
            className="font-script text-5xl sm:text-6xl text-[#4a3226]/[0.07] leading-none select-none -mb-6 tracking-normal"
          >
            Forever
          </span>

          {/* Spaced Faded Eyebrow */}
          <p className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.36em] text-[#4a3226]/60 font-medium mb-1.5">
            The Ring Ceremony
          </p>

          {/* Single-Line Editorial Serif Couple Names */}
          <h1 className="font-cormorant italic font-semibold text-[30px] sm:text-[34px] tracking-[0.04em] text-[#3b251b]/78 leading-none whitespace-nowrap">
            Suvarna <span className="font-normal text-[#6e4b3a]/65 mx-0.5">&amp;</span> Rajesh
          </h1>
        </div>

        {/* Bottom Repeated Watermark Pattern ("Suvarna Rajesh Suvarna Rajesh ...") */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[34%] z-10 overflow-hidden flex flex-col justify-end pb-3 pointer-events-none select-none poster-fade-in"
          style={{
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)',
          }}
        >
          <div className="flex flex-col gap-1.5 -mx-10 items-center">
            {[
              'SUVARNA · RAJESH · SUVARNA · RAJESH · SUVARNA',
              'RAJESH · SUVARNA · RAJESH · SUVARNA · RAJESH',
              'SUVARNA · RAJESH · SUVARNA · RAJESH · SUVARNA',
              'RAJESH · SUVARNA · RAJESH · SUVARNA · RAJESH',
              'SUVARNA · RAJESH · SUVARNA · RAJESH · SUVARNA',
            ].map((row, idx) => (
              <p
                key={idx}
                className="font-heading text-[13px] sm:text-sm tracking-[0.28em] whitespace-nowrap text-[#3b251b]/[0.11] font-medium uppercase leading-tight"
              >
                {row}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
