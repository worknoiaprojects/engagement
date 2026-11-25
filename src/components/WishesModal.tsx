import React, { useState } from 'react';
import { Heart, MessageCircle, Send, X } from 'lucide-react';
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
    confetti({
      particleCount: 30,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#7e22ce', '#a855f7', '#d8b4fe', '#fef08a'],
      disableForReducedMotion: true,
    });
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
          <div className="w-full h-full overflow-y-auto pr-1 pb-12 space-y-2">
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
                  className="w-full text-left p-3 rounded-2xl bg-white/75 shadow-[0_2px_10px_rgba(46,8,84,0.06)] space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-sans font-semibold text-[#2e0854] truncate">
                      {wish.name}
                    </span>
                    <span className="text-[9px] font-sans text-[#7e22ce]/70 shrink-0">
                      {wish.createdAt}
                    </span>
                  </div>
                  <p className="text-[11.5px] font-sans text-[#4c1d95] leading-relaxed break-words">
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
            <button
              type="submit"
              title="Post Blessing"
              className="h-[46px] px-3.5 rounded-xl bg-gradient-to-br from-[#7e22ce] to-[#581c87] text-white shadow-[0_4px_14px_rgba(88,28,135,0.28)] hover:shadow-[0_6px_18px_rgba(88,28,135,0.36)] active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
