import React, { useState } from 'react';
import { Heart, MessageCircle, Send, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface VisitorWish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

interface WishesModalProps {
  isOpen: boolean;
  isClosing: boolean;
  clickOrigin: { x: number; y: number } | null;
  onClose: () => void;
  likesCount: number;
  hasLiked: boolean;
  onToggleLike: () => void;
  wishes: VisitorWish[];
  onAddWish: (name: string, message: string) => void;
}

export const WishesModal: React.FC<WishesModalProps> = ({
  isOpen,
  isClosing,
  clickOrigin,
  onClose,
  likesCount,
  hasLiked,
  onToggleLike,
  wishes,
  onAddWish,
}) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [heartBurstKey, setHeartBurstKey] = useState(0);

  if (!isOpen) return null;

  const startX = clickOrigin ? Math.round(clickOrigin.x - window.innerWidth / 2) : 0;
  const startY = clickOrigin ? Math.round(clickOrigin.y - window.innerHeight / 2) : 0;

  const handleLikeClick = () => {
    onToggleLike();
    if (!hasLiked) {
      setHeartBurstKey((k) => k + 1);
      confetti({
        particleCount: 24,
        spread: 55,
        origin: { y: 0.42 },
        colors: ['#7e22ce', '#a855f7', '#ec4899', '#f3e8ff'],
        disableForReducedMotion: true,
      });
    }
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

        {/* Header + Interactive Like Animation */}
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

          {/* Interactive Like Button with Floating Heart Burst */}
          <button
            type="button"
            onClick={handleLikeClick}
            className={`relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full shadow-[0_3px_12px_rgba(46,8,84,0.1)] transition-all active:scale-95 cursor-pointer ${
              hasLiked
                ? 'bg-gradient-to-r from-[#7e22ce] to-[#9333ea] text-white'
                : 'bg-white text-[#581c87] hover:text-[#2e0854]'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-300 ${
                hasLiked ? 'fill-white text-white scale-110' : 'text-[#7e22ce]'
              }`}
            />
            <span className="text-[11px] font-sans font-semibold">
              {hasLiked ? 'Loved' : 'Send Love'} &middot; {likesCount}
            </span>

            {heartBurstKey > 0 && (
              <span
                key={heartBurstKey}
                aria-hidden="true"
                className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1.5"
              >
                <Heart className="w-3 h-3 text-[#a855f7] fill-[#a855f7] heart-float-burst" />
                <Heart className="w-2.5 h-2.5 text-[#ec4899] fill-[#ec4899] heart-float-burst [animation-delay:80ms]" />
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Visitor Comments Feed */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto my-3 pr-1 space-y-2">
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
