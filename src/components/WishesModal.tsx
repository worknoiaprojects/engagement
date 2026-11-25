import React, { useRef, useState } from 'react';
import { Heart, MessageCircle, Send, Sparkles, Star, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface VisitorWish {
  id: string;
  name: string;
  message: string;
  loveCount?: number;
  createdAt: string;
}

interface LoveFlare {
  id: number;
  x: number;
  rot: number;
  color: string;
  size: number;
}

interface WishesModalProps {
  isOpen: boolean;
  isClosing: boolean;
  clickOrigin: { x: number; y: number } | null;
  onClose: () => void;
  likesCount: number;
  onSendLove: () => void;
  wishes: VisitorWish[];
  onAddWish: (name: string, message: string) => void;
}

const FLARE_COLORS = ['#ef4444', '#f43f5e', '#ec4899', '#fb7185', '#f97316'];

export const WishesModal: React.FC<WishesModalProps> = ({
  isOpen,
  isClosing,
  clickOrigin,
  onClose,
  likesCount,
  onSendLove,
  wishes,
  onAddWish,
}) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [flares, setFlares] = useState<LoveFlare[]>([]);
  const [ringPulse, setRingPulse] = useState(0);
  const [commentSparks, setCommentSparks] = useState<LoveFlare[]>([]);
  const [commentCelebrateKey, setCommentCelebrateKey] = useState(0);
  const sendBtnRef = useRef<HTMLButtonElement | null>(null);

  if (!isOpen) return null;

  const startX = clickOrigin ? Math.round(clickOrigin.x - window.innerWidth / 2) : 0;
  const startY = clickOrigin ? Math.round(clickOrigin.y - window.innerHeight / 2) : 0;

  const handleLoveTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    onSendLove();
    setRingPulse((p) => p + 1);

    // Spawn multiple rising heart flares per tap for rapid-click feedback
    const batch: LoveFlare[] = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + Math.random() + i,
      x: Math.round((Math.random() - 0.5) * 56),
      rot: Math.round((Math.random() - 0.5) * 44),
      color: FLARE_COLORS[Math.floor(Math.random() * FLARE_COLORS.length)],
      size: 12 + Math.floor(Math.random() * 8),
    }));

    setFlares((prev) => [...prev.slice(-24), ...batch]);
    setTimeout(() => {
      const ids = new Set(batch.map((b) => b.id));
      setFlares((prev) => prev.filter((f) => !ids.has(f.id)));
    }, 950);

    // Fire crisp mini confetti flares right from the tapped red heart button
    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 10,
      spread: 50,
      startVelocity: 22,
      ticks: 45,
      scalar: 0.75,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#ef4444', '#f43f5e', '#fb7185', '#fde047'],
      disableForReducedMotion: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedMsg = message.trim();
    if (!trimmedName || !trimmedMsg) return;

    onAddWish(trimmedName, trimmedMsg);
    setName('');
    setMessage('');
    setCommentCelebrateKey((k) => k + 1);

    // Spawn 14 rising golden/purple/rose celebration particles directly from the comment button
    const sparkPalette = ['#facc15', '#a855f7', '#ec4899', '#7e22ce', '#fde047', '#f43f5e'];
    const sparks: LoveFlare[] = Array.from({ length: 14 }, (_, i) => ({
      id: Date.now() + Math.random() + i,
      x: Math.round((Math.random() - 0.5) * 130),
      rot: Math.round((Math.random() - 0.5) * 90),
      color: sparkPalette[i % sparkPalette.length],
      size: 11 + Math.floor(Math.random() * 9),
    }));
    setCommentSparks(sparks);
    setTimeout(() => {
      const ids = new Set(sparks.map((s) => s.id));
      setCommentSparks((prev) => prev.filter((s) => !ids.has(s.id)));
    }, 1200);

    // Launch 4-wave fireworks celebration confetti directly from the comment button's coordinates
    const rect = sendBtnRef.current?.getBoundingClientRect();
    const origin = rect
      ? {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        }
      : { x: 0.78, y: 0.78 };

    // Wave 1: Main starburst
    confetti({
      particleCount: 55,
      spread: 100,
      startVelocity: 40,
      ticks: 80,
      origin,
      colors: ['#facc15', '#9333ea', '#ec4899', '#d8b4fe', '#ffffff'],
      disableForReducedMotion: true,
    });

    // Wave 2: Twin angled cannons
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 118,
        spread: 55,
        startVelocity: 36,
        ticks: 75,
        shapes: ['star', 'circle'],
        origin,
        colors: ['#fde047', '#a855f7', '#fb7185'],
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 30,
        angle: 68,
        spread: 55,
        startVelocity: 36,
        ticks: 75,
        shapes: ['star', 'circle'],
        origin,
        colors: ['#facc15', '#c084fc', '#f43f5e'],
        disableForReducedMotion: true,
      });
    }, 140);

    // Wave 3: High-arcing golden shimmer shower
    setTimeout(() => {
      confetti({
        particleCount: 36,
        spread: 85,
        startVelocity: 45,
        scalar: 1.05,
        ticks: 85,
        shapes: ['star'],
        origin,
        colors: ['#facc15', '#fef08a', '#e9d5ff', '#ec4899'],
        disableForReducedMotion: true,
      });
    }, 320);

    // Wave 4: Floating petal afterglow
    setTimeout(() => {
      confetti({
        particleCount: 26,
        spread: 110,
        startVelocity: 24,
        gravity: 0.6,
        ticks: 90,
        origin,
        colors: ['#d8b4fe', '#fbcfe8', '#fef08a', '#a855f7'],
        disableForReducedMotion: true,
      });
    }, 520);
  };

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 popup-modal-backdrop ${
        isClosing ? 'closing' : 'entering'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={
          {
            '--start-x': `${startX}px`,
            '--start-y': `${startY}px`,
          } as React.CSSProperties
        }
        className={`w-full max-w-[350px] h-[480px] max-h-[82dvh] p-5 rounded-[30px] apple-liquid-glass-modal popup-modal-card relative shadow-2xl flex flex-col justify-between ${
          isClosing ? 'modal-exit-origin' : 'modal-enter-origin'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          title="Close Wishes"
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center bg-white shadow-[0_2px_8px_rgba(46,8,84,0.12)] hover:shadow-[0_4px_12px_rgba(46,8,84,0.18)] text-[#581c87] hover:text-[#2e0854] transition-all cursor-pointer z-10"
        >
          <X className="w-3.5 h-3.5 text-[#581c87]" />
        </button>

        {/* Header */}
        <div className="w-full flex flex-col items-center text-center space-y-2 pt-0.5 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-[0_2px_8px_rgba(46,8,84,0.08)]">
            <MessageCircle className="w-3 h-3 text-[#7e22ce]" />
            <span className="text-[10px] font-sans font-semibold text-[#6b21a8]">
              Blessings &amp; Wishes
            </span>
          </div>

          <h3 className="font-heading text-base text-[#2e0854] font-semibold leading-snug">
            Share Your Love for Suvarna &amp; Rajesh
          </h3>
        </div>

        {/* Scrollable Visitor Comments Feed + Floating Bottom-Right Red Love Button */}
        <div className="relative w-full flex-1 min-h-0 my-3">
          <div
            style={{ touchAction: 'pan-y' }}
            className="w-full h-full overflow-y-auto overscroll-contain pr-1 pb-14 space-y-2"
          >
            {wishes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6 rounded-2xl bg-white/55">
                <Heart className="w-5 h-5 text-[#9333ea]/50 mb-1.5" />
                <p className="text-[11px] font-sans text-[#4c1d95]/75 leading-relaxed">
                  Be the first to bless Suvarna &amp; Rajesh with your warm wishes.
                </p>
              </div>
            ) : (
              wishes.map((wish) => (
                <div
                  key={wish.id}
                  className="w-full text-left p-3 rounded-2xl bg-white/75 shadow-[0_2px_10px_rgba(46,8,84,0.06)] space-y-1 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-[11px] font-sans font-semibold text-[#2e0854] truncate min-w-0">
                      {wish.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffe4e6] text-[#e11d48] text-[9.5px] font-sans font-bold">
                        <Heart className="w-2.5 h-2.5 fill-[#e11d48] text-[#e11d48]" />
                        {wish.loveCount ?? 0}
                      </span>
                      <span className="text-[9px] font-sans text-[#7e22ce]/70">
                        {wish.createdAt}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11.5px] font-sans text-[#4c1d95] leading-relaxed [overflow-wrap:anywhere]">
                    {wish.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Floating Red Love Button at Bottom-Right of Comments Box */}
          <div className="absolute bottom-2.5 right-2.5 z-20 flex flex-col items-center">
            {/* Rising Heart Flares */}
            <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2">
              {flares.map((flare) => (
                <Heart
                  key={flare.id}
                  style={
                    {
                      width: `${flare.size}px`,
                      height: `${flare.size}px`,
                      color: flare.color,
                      fill: flare.color,
                      '--flare-x': `${flare.x}px`,
                      '--flare-rot': `${flare.rot}deg`,
                    } as React.CSSProperties
                  }
                  className="absolute -left-2 bottom-0 love-flare-rise drop-shadow-sm"
                />
              ))}
            </div>

            {/* Expanding Radial Flare Ring on Tap */}
            {ringPulse > 0 && (
              <span
                key={ringPulse}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-[#f43f5e] love-ring-flare"
              />
            )}

            <button
              type="button"
              onClick={handleLoveTap}
              title="Tap rapidly to send love!"
              className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#ef4444] to-[#e11d48] text-white shadow-[0_6px_20px_rgba(225,29,72,0.45)] hover:shadow-[0_8px_24px_rgba(225,29,72,0.6)] active:scale-90 transition-transform flex items-center justify-center cursor-pointer select-none"
            >
              <Heart className="w-5 h-5 fill-white text-white" />
              {likesCount > 0 && (
                <span className="absolute -top-2 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-white text-[#e11d48] text-[10px] font-sans font-bold shadow-[0_2px_8px_rgba(225,29,72,0.28)] flex items-center justify-center">
                  {likesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Visitor Comment Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-2 shrink-0">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            maxLength={40}
            required
            className="w-full px-3.5 py-2 rounded-xl bg-white/90 text-[11.5px] font-sans text-[#2e0854] placeholder:text-[#6b21a8]/45 shadow-[inset_0_1px_4px_rgba(46,8,84,0.08)] focus:outline-none focus:ring-2 focus:ring-[#9333ea]/35"
          />
          <div className="flex items-end gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your blessings..."
              rows={2}
              maxLength={220}
              required
              className="flex-1 px-3.5 py-2 rounded-xl bg-white/90 text-[11.5px] font-sans text-[#2e0854] placeholder:text-[#6b21a8]/45 shadow-[inset_0_1px_4px_rgba(46,8,84,0.08)] focus:outline-none focus:ring-2 focus:ring-[#9333ea]/35 resize-none"
            />
            <div className="relative shrink-0">
              {/* Rising Celebration Sparks from Comment Button */}
              <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-30">
                {commentSparks.map((spark, idx) => (
                  <span
                    key={spark.id}
                    style={
                      {
                        '--spark-x': `${spark.x}px`,
                        '--spark-rot': `${spark.rot}deg`,
                      } as React.CSSProperties
                    }
                    className="absolute -left-2 bottom-0 comment-spark-rise"
                  >
                    {idx % 3 === 0 ? (
                      <Sparkles
                        style={{ width: `${spark.size}px`, height: `${spark.size}px`, color: spark.color }}
                        className="drop-shadow-sm"
                      />
                    ) : idx % 3 === 1 ? (
                      <Heart
                        style={{
                          width: `${spark.size}px`,
                          height: `${spark.size}px`,
                          color: spark.color,
                          fill: spark.color,
                        }}
                        className="drop-shadow-sm"
                      />
                    ) : (
                      <Star
                        style={{
                          width: `${spark.size}px`,
                          height: `${spark.size}px`,
                          color: spark.color,
                          fill: spark.color,
                        }}
                        className="drop-shadow-sm"
                      />
                    )}
                  </span>
                ))}
              </div>

              {/* Triple Staggered Celebration Shockwave Rings */}
              {commentCelebrateKey > 0 && (
                <React.Fragment key={commentCelebrateKey}>
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl border-2 border-[#facc15] love-ring-flare"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl border-2 border-[#ec4899] love-ring-flare [animation-delay:110ms]"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl border-2 border-[#a855f7] love-ring-flare [animation-delay:220ms]"
                  />
                </React.Fragment>
              )}

              <button
                ref={sendBtnRef}
                key={`btn-${commentCelebrateKey}`}
                type="submit"
                title="Post Blessing"
                className={`comment-btn-sheen relative h-[46px] px-3.5 rounded-xl bg-gradient-to-br from-[#a855f7] via-[#7e22ce] to-[#ec4899] text-white shadow-[0_4px_16px_rgba(88,28,135,0.34)] hover:shadow-[0_6px_22px_rgba(147,51,234,0.45)] active:scale-95 transition-all flex items-center justify-center cursor-pointer ${
                  commentCelebrateKey > 0 ? 'comment-btn-celebrate' : ''
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
