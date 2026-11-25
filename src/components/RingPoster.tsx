import React from 'react';

interface RingPosterProps {
  language?: 'en' | 'te';
}

const POSTER_CONTENT = {
  en: {
    alt: 'The Ring Ceremony - Suvarna & Rajesh',
    watermarkTop: 'Forever',
    eyebrow: 'The Ring Ceremony',
    bride: 'Suvarna',
    groom: 'Rajesh',
    rows: [
      'SUVARNA · RAJESH · SUVARNA · RAJESH · SUVARNA',
      'RAJESH · SUVARNA · RAJESH · SUVARNA · RAJESH',
      'SUVARNA · RAJESH · SUVARNA · RAJESH · SUVARNA',
      'RAJESH · SUVARNA · RAJESH · SUVARNA · RAJESH',
      'SUVARNA · RAJESH · SUVARNA · RAJESH · SUVARNA',
    ],
  },
  te: {
    alt: 'నిశ్చితార్థం - సువర్ణ & రాజేష్',
    watermarkTop: 'శుభం',
    eyebrow: 'నిశ్చితార్థం',
    bride: 'సువర్ణ',
    groom: 'రాజేష్',
    rows: [
      'సువర్ణ · రాజేష్ · సువర్ణ · రాజేష్ · సువర్ణ',
      'రాజేష్ · సువర్ణ · రాజేష్ · సువర్ణ · రాజేష్',
      'సువర్ణ · రాజేష్ · సువర్ణ · రాజేష్ · సువర్ణ',
      'రాజేష్ · సువర్ణ · రాజేష్ · సువర్ణ · రాజేష్',
      'సువర్ణ · రాజేష్ · సువర్ణ · రాజేష్ · సువర్ణ',
    ],
  },
} as const;

export const RingPoster: React.FC<RingPosterProps> = ({ language = 'en' }) => {
  const isTelugu = language === 'te';
  const copy = POSTER_CONTENT[language];

  return (
    <div className="relative bg-[#0b0314] h-[100dvh] w-full overflow-hidden flex items-center justify-center p-5">
      {/* Small Centered 4:5 Editorial Poster (Matches Exact 736x920 Proportions, Not Full Screen) */}
      <div className="relative w-full max-w-[360px] aspect-[4/5] max-h-[84dvh] rounded-2xl overflow-hidden bg-[#f5efe6] shadow-[0_24px_80px_rgba(0,0,0,0.75)] select-none">
        {/* Backlit Ring Ceremony Silhouette Artwork (Exact 4:5 Natural Proportions) */}
        <img
          src="/images/ring_ceremony.jpg"
          alt={copy.alt}
          decoding="sync"
          loading="eager"
          className="w-full h-full object-cover object-center pointer-events-none select-none block"
        />

        {/* Soft Warm Ivory Top Veil */}
        <div
          className="absolute inset-x-0 top-0 h-[32%] pointer-events-none"
          style={{
            background: isTelugu
              ? 'linear-gradient(180deg, #f3ece2 0%, #f3ece2 18%, rgba(244, 238, 229, 0.85) 55%, rgba(244, 238, 229, 0) 100%)'
              : 'linear-gradient(180deg, #f6f1ea 0%, rgba(246, 241, 234, 0.92) 30%, rgba(246, 241, 234, 0) 100%)',
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
        <div
          className={`absolute inset-x-0 top-0 z-10 flex flex-col items-center text-center px-4 poster-fade-in ${
            isTelugu ? 'pt-8 sm:pt-9' : 'pt-12 sm:pt-14'
          }`}
        >
          {/* Ghosted Watermark Layer */}
          <span
            aria-hidden="true"
            className={`${
              isTelugu
                ? 'font-telugu-artistic text-6xl sm:text-7xl absolute top-5 sm:top-6 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap'
                : 'font-script text-5xl sm:text-6xl -mb-6'
            } text-[#4a3226]/[0.07] leading-none select-none tracking-normal`}
          >
            {copy.watermarkTop}
          </span>

          {/* Spaced Faded Eyebrow */}
          <p
            className={`${
              isTelugu
                ? 'font-telugu-tiro text-sm sm:text-[15px] tracking-[0.18em] relative text-[#4a3226]/65 mb-2'
                : 'font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.36em] text-[#4a3226]/60 mb-1.5'
            } font-medium`}
          >
            {copy.eyebrow}
          </p>

          {/* Single-Line Editorial Couple Names */}
          <h1
            className={`${
              isTelugu
                ? 'font-telugu-krushna font-normal text-[30px] sm:text-[34px] tracking-wide relative text-[#3b251b]/82'
                : 'font-cormorant italic font-semibold text-[30px] sm:text-[34px] tracking-[0.04em] text-[#3b251b]/78'
            } leading-none whitespace-nowrap`}
          >
            {copy.bride} <span className="font-normal text-[#6e4b3a]/65 mx-0.5">&amp;</span> {copy.groom}
          </h1>
        </div>

        {/* Bottom Repeated Watermark Pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[34%] z-10 overflow-hidden flex flex-col justify-end pb-3 pointer-events-none select-none poster-fade-in"
          style={{
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)',
          }}
        >
          <div className="flex flex-col gap-1.5 -mx-10 items-center">
            {copy.rows.map((row, idx) => (
              <p
                key={idx}
                className={`${
                  isTelugu
                    ? 'font-telugu-clean text-[13px] sm:text-sm tracking-[0.18em]'
                    : 'font-heading text-[13px] sm:text-sm tracking-[0.28em] uppercase'
                } whitespace-nowrap text-[#3b251b]/[0.11] font-medium leading-tight`}
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
