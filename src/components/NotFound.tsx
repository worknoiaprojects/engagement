import React from 'react';
import { Heart, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  const handleGoHome = () => {
    window.location.assign('/');
  };

  return (
    <div className="relative bg-[#0b0314] h-[100dvh] w-full overflow-hidden flex items-center justify-center p-5 select-none">
      {/* Subtle Royal Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#7e22ce]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#a855f7]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Frosted Royal 404 Card */}
      <div className="relative z-10 w-full max-w-[350px] p-7 sm:p-8 rounded-[30px] apple-liquid-glass-modal flex flex-col items-center text-center space-y-5 shadow-2xl">
        {/* Monogram Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white shadow-[0_2px_10px_rgba(46,8,84,0.1)]">
          <Heart className="w-3 h-3 text-[#7e22ce] fill-[#7e22ce]" />
          <span className="text-[10px] font-sans font-semibold text-[#6b21a8] tracking-widest uppercase">
            Suvarna &amp; Rajesh
          </span>
        </div>

        {/* 404 Display */}
        <div className="space-y-1.5">
          <div className="font-heading text-5xl sm:text-6xl font-bold purple-gradient-text leading-none">
            404
          </div>
          <h1 className="font-heading text-lg sm:text-xl text-[#2e0854] font-semibold">
            Invitation Page Not Found
          </h1>
          <p className="text-xs font-sans text-[#4c1d95]/85 leading-relaxed px-2">
            The link you followed doesn&apos;t exist, but our celebration awaits you at the main invitation.
          </p>
        </div>

        {/* Return to Invitation CTA */}
        <button
          type="button"
          onClick={handleGoHome}
          className="px-5 py-2.5 rounded-full bg-white shadow-[0_4px_16px_rgba(46,8,84,0.14)] hover:shadow-[0_6px_20px_rgba(46,8,84,0.22)] active:scale-95 inline-flex items-center gap-2 text-xs font-sans font-semibold text-[#581c87] hover:text-[#2e0854] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#7e22ce]" />
          <span>Open Invitation</span>
        </button>
      </div>
    </div>
  );
};
