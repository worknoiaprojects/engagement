import React, { useState } from 'react';
import { Download } from 'lucide-react';

interface RingPosterProps {
  language?: 'en' | 'te';
}

const POSTER_WIDTH_4K = 3072;
const POSTER_HEIGHT_4K = 3840;

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
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload4K = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      await document.fonts.ready;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = '/images/ring_ceremony.jpg';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load poster image'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = POSTER_WIDTH_4K;
      canvas.height = POSTER_HEIGHT_4K;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = POSTER_WIDTH_4K;
      const H = POSTER_HEIGHT_4K;
      const s = W / 360; // Scale factor from 360px preview card to 3072px 4K output

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clip to exact rounded-2xl corner radius (16px scaled to 4K) with transparent outer corners
      const cornerRadius = Math.round(16 * s);
      ctx.save();
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(0, 0, W, H, cornerRadius);
      } else {
        ctx.moveTo(cornerRadius, 0);
        ctx.lineTo(W - cornerRadius, 0);
        ctx.quadraticCurveTo(W, 0, W, cornerRadius);
        ctx.lineTo(W, H - cornerRadius);
        ctx.quadraticCurveTo(W, H, W - cornerRadius, H);
        ctx.lineTo(cornerRadius, H);
        ctx.quadraticCurveTo(0, H, 0, H - cornerRadius);
        ctx.lineTo(0, cornerRadius);
        ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
      }
      ctx.closePath();
      ctx.clip();

      // 1. Base Backlit Ring Ceremony Artwork
      ctx.drawImage(img, 0, 0, W, H);

      // 2. Soft Warm Ivory Top Veil
      const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.32);
      if (isTelugu) {
        topGrad.addColorStop(0, '#f3ece2');
        topGrad.addColorStop(0.18, '#f3ece2');
        topGrad.addColorStop(0.55, 'rgba(244, 238, 229, 0.85)');
        topGrad.addColorStop(1, 'rgba(244, 238, 229, 0)');
      } else {
        topGrad.addColorStop(0, '#f6f1ea');
        topGrad.addColorStop(0.3, 'rgba(246, 241, 234, 0.92)');
        topGrad.addColorStop(1, 'rgba(246, 241, 234, 0)');
      }
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, W, H * 0.32);

      // 3. Subtle Radial Vignette
      const vignette = ctx.createRadialGradient(W * 0.5, H * 0.52, W * 0.35, W * 0.5, H * 0.52, W * 0.78);
      vignette.addColorStop(0, 'rgba(42, 26, 18, 0)');
      vignette.addColorStop(1, 'rgba(42, 26, 18, 0.14)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      // 4. Upper Editorial Typography
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      if (isTelugu) {
        // Ghosted శుభం watermark
        ctx.font = `${Math.round(64 * s)}px "Gidugu", cursive`;
        ctx.fillStyle = 'rgba(74, 50, 38, 0.07)';
        ctx.fillText(copy.watermarkTop, W / 2, 22 * s);

        // Eyebrow: నిశ్చితార్థం
        ctx.font = `500 ${Math.round(14.5 * s)}px "Tiro Telugu", "Suranna", serif`;
        ctx.fillStyle = 'rgba(74, 50, 38, 0.65)';
        ctx.fillText(copy.eyebrow, W / 2, 34 * s);

        // Couple names: సువర్ణ & రాజేష్
        ctx.font = `400 ${Math.round(32 * s)}px "Sree Krushnadevaraya", "Noto Serif Telugu", serif`;
        ctx.fillStyle = 'rgba(59, 37, 27, 0.82)';
        ctx.fillText(`${copy.bride} & ${copy.groom}`, W / 2, 60 * s);
      } else {
        // Ghosted Forever watermark
        ctx.font = `${Math.round(52 * s)}px "Pinyon Script", cursive`;
        ctx.fillStyle = 'rgba(74, 50, 38, 0.07)';
        ctx.fillText(copy.watermarkTop, W / 2, 48 * s);

        // Spaced Eyebrow: THE RING CEREMONY
        ctx.font = `500 ${Math.round(10.5 * s)}px "Montserrat", sans-serif`;
        ctx.fillStyle = 'rgba(74, 50, 38, 0.60)';
        const spacedEyebrow = copy.eyebrow.toUpperCase().split('').join('\u200A');
        ctx.fillText(spacedEyebrow, W / 2, 76 * s);

        // Single-line Couple Names: Suvarna & Rajesh
        ctx.font = `italic 600 ${Math.round(32 * s)}px "Cormorant Garamond", serif`;
        const brideW = ctx.measureText(`${copy.bride} `).width;
        const groomW = ctx.measureText(` ${copy.groom}`).width;
        ctx.font = `italic 400 ${Math.round(32 * s)}px "Cormorant Garamond", serif`;
        const ampW = ctx.measureText('&').width;
        const totalW = brideW + ampW + groomW;
        let curX = W / 2 - totalW / 2;
        const namesY = 98 * s;

        ctx.textAlign = 'left';
        ctx.font = `italic 600 ${Math.round(32 * s)}px "Cormorant Garamond", serif`;
        ctx.fillStyle = 'rgba(59, 37, 27, 0.78)';
        ctx.fillText(`${copy.bride} `, curX, namesY);
        curX += brideW;

        ctx.font = `italic 400 ${Math.round(32 * s)}px "Cormorant Garamond", serif`;
        ctx.fillStyle = 'rgba(110, 75, 58, 0.65)';
        ctx.fillText('&', curX, namesY);
        curX += ampW;

        ctx.font = `italic 600 ${Math.round(32 * s)}px "Cormorant Garamond", serif`;
        ctx.fillStyle = 'rgba(59, 37, 27, 0.78)';
        ctx.fillText(` ${copy.groom}`, curX, namesY);
      }

      // 5. Bottom Repeated Watermark Rows with Vertical Fade Mask
      const wmCanvas = document.createElement('canvas');
      wmCanvas.width = W;
      wmCanvas.height = Math.round(H * 0.34);
      const wmCtx = wmCanvas.getContext('2d');
      if (wmCtx) {
        wmCtx.textAlign = 'center';
        wmCtx.textBaseline = 'bottom';
        wmCtx.fillStyle = 'rgba(59, 37, 27, 0.12)';
        wmCtx.font = isTelugu
          ? `500 ${Math.round(13.5 * s)}px "Mandali", sans-serif`
          : `500 ${Math.round(13.5 * s)}px "Playfair Display", serif`;

        const rowGap = 22 * s;
        copy.rows.forEach((row, idx) => {
          const y = wmCanvas.height - 14 * s - (copy.rows.length - 1 - idx) * rowGap;
          wmCtx.fillText(row, W / 2, y);
        });

        wmCtx.globalCompositeOperation = 'destination-in';
        const fadeMask = wmCtx.createLinearGradient(0, wmCanvas.height, 0, 0);
        fadeMask.addColorStop(0, 'rgba(0,0,0,0.95)');
        fadeMask.addColorStop(0.55, 'rgba(0,0,0,0.5)');
        fadeMask.addColorStop(1, 'rgba(0,0,0,0)');
        wmCtx.fillStyle = fadeMask;
        wmCtx.fillRect(0, 0, wmCanvas.width, wmCanvas.height);

        ctx.drawImage(wmCanvas, 0, H - wmCanvas.height);
      }

      ctx.restore();

      // 6. Export Lossless 4K PNG
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png', 1.0)
      );
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = isTelugu
        ? 'Suvarna_Rajesh_Nischithardham_4K.png'
        : 'Suvarna_Rajesh_Ring_Ceremony_4K.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative bg-[#0b0314] h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center gap-4 p-5">
      {/* Small Centered 4:5 Editorial Poster (Matches Exact 736x920 Proportions, Not Full Screen) */}
      <div className="relative w-full max-w-[360px] aspect-[4/5] max-h-[78dvh] rounded-2xl overflow-hidden bg-[#f5efe6] shadow-[0_24px_80px_rgba(0,0,0,0.75)] select-none">
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

      {/* Subtle 4K Download Action Below Poster */}
      <button
        type="button"
        onClick={handleDownload4K}
        disabled={isExporting}
        className="apple-liquid-glass px-5 py-2.5 rounded-full inline-flex items-center gap-2 text-xs font-sans font-medium tracking-wide text-[#f5efe6] hover:text-white shadow-xl cursor-pointer transition-all active:scale-95 disabled:opacity-60"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isExporting ? 'Rendering 4K...' : 'Download 4K'}</span>
      </button>
    </div>
  );
};
