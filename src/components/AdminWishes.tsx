import React, { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { Heart, Lock, MessageCircle, RefreshCw, Trash2, ShieldCheck } from 'lucide-react';
import { db } from '../lib/firebase';
import type { VisitorWish } from './WishesModal';

const DEFAULT_ADMIN_PASSCODE = '938101';

export const AdminWishes: React.FC = () => {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [authError, setAuthError] = useState('');

  const [wishes, setWishes] = useState<VisitorWish[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isChecking) return;
    setIsChecking(true);
    setAuthError('');

    try {
      const adminRef = doc(db, 'config', 'admin');
      const snap = await getDoc(adminRef);

      let expectedPassword = DEFAULT_ADMIN_PASSCODE;
      if (snap.exists()) {
        const data = snap.data();
        if (data?.password !== undefined && data?.password !== null) {
          expectedPassword = String(data.password);
        }
      } else {
        // Seed DB passcode document on first check if missing
        await setDoc(adminRef, { password: DEFAULT_ADMIN_PASSCODE }, { merge: true }).catch(
          () => {}
        );
      }

      if (passcode.trim() === expectedPassword) {
        setIsUnlocked(true);
      } else {
        setAuthError('Incorrect passcode. Please try again.');
      }
    } catch {
      // Fallback if Firestore rules restrict config read before auth
      if (passcode.trim() === DEFAULT_ADMIN_PASSCODE) {
        setIsUnlocked(true);
      } else {
        setAuthError('Unable to verify passcode right now.');
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!isUnlocked) return;

    setIsLoadingData(true);
    const wishesQuery = query(collection(db, 'wishes'), orderBy('createdAtMs', 'desc'));
    const unsubWishes = onSnapshot(
      wishesQuery,
      (snapshot) => {
        const items: VisitorWish[] = snapshot.docs.map((d) => {
          const data = d.data();
          const ts = typeof data.createdAtMs === 'number' ? data.createdAtMs : null;
          return {
            id: d.id,
            name: String(data.name || 'Guest'),
            message: String(data.message || ''),
            loveCount: Number(data.loveCount || 0),
            createdAt: ts
              ? new Date(ts).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : String(data.createdAt || 'Just now'),
          };
        });
        setWishes(items);
        setIsLoadingData(false);
      },
      () => setIsLoadingData(false)
    );

    const statsRef = doc(db, 'stats', 'engagement');
    const unsubStats = onSnapshot(statsRef, (snap) => {
      if (snap.exists()) {
        setTotalLikes(Number(snap.data()?.totalLikes || 0));
      }
    });

    return () => {
      unsubWishes();
      unsubStats();
    };
  }, [isUnlocked]);

  const handleDeleteWish = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'wishes', id));
    } catch (err) {
      console.warn('Could not delete wish:', err);
    }
  };

  return (
    <div className="relative bg-[#0b0314] min-h-[100dvh] h-[100dvh] w-full overflow-hidden flex justify-center">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#7e22ce]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px] h-[100dvh] flex flex-col bg-[#120621]/85 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.85)]">
        {!isUnlocked ? (
          <div className="flex-1 flex items-center justify-center p-5">
            <form
              onSubmit={handleUnlock}
              className="w-full max-w-[330px] p-6 rounded-[28px] apple-liquid-glass-modal flex flex-col items-center text-center space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-[0_4px_14px_rgba(46,8,84,0.12)] flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#7e22ce]" />
              </div>

              <div className="space-y-1">
                <h1 className="font-heading text-lg font-semibold text-[#2e0854]">
                  Wishes Admin
                </h1>
                <p className="text-[11px] font-sans text-[#4c1d95]/80">
                  Enter passcode to view guest blessings &amp; love counts
                </p>
              </div>

              <input
                type="password"
                inputMode="numeric"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Passcode"
                autoFocus
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white text-center text-sm font-sans font-semibold tracking-[0.25em] text-[#2e0854] placeholder:tracking-normal placeholder:font-normal placeholder:text-[#6b21a8]/45 shadow-[inset_0_1px_4px_rgba(46,8,84,0.08)] focus:outline-none focus:ring-2 focus:ring-[#9333ea]/40"
              />

              {authError && (
                <p className="text-[11px] font-sans font-medium text-[#e11d48]">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={isChecking}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#7e22ce] to-[#581c87] text-white text-xs font-sans font-semibold shadow-[0_4px_16px_rgba(88,28,135,0.3)] active:scale-98 transition-all cursor-pointer disabled:opacity-60"
              >
                {isChecking ? 'Verifying...' : 'Unlock Wishes'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Mobile Admin Header */}
            <header className="px-4 pt-5 pb-4 border-b border-white/10 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#d8b4fe]" />
                  <h1 className="font-heading text-lg font-semibold text-white">
                    Suvarna &amp; Rajesh · Wishes
                  </h1>
                </div>
                <span className="text-[10px] font-sans uppercase tracking-widest text-[#d8b4fe]/75 px-2.5 py-1 rounded-full bg-white/10">
                  Live
                </span>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ef4444] to-[#e11d48] flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-base font-sans font-bold text-white leading-none">
                      {totalLikes}
                    </div>
                    <div className="text-[10px] font-sans text-[#d8b4fe]/80 mt-0.5">
                      Total Love
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7e22ce] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-base font-sans font-bold text-white leading-none">
                      {wishes.length}
                    </div>
                    <div className="text-[10px] font-sans text-[#d8b4fe]/80 mt-0.5">
                      Guest Wishes
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Scrollable Wishes List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5">
              {isLoadingData ? (
                <div className="h-full flex items-center justify-center text-[#d8b4fe]/75 gap-2 text-xs font-sans">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading wishes...</span>
                </div>
              ) : wishes.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 text-[#d8b4fe]/70 space-y-2">
                  <Heart className="w-6 h-6 text-[#a855f7]/60" />
                  <p className="text-xs font-sans">
                    No guest wishes yet. They will appear here live as visitors post them.
                  </p>
                </div>
              ) : (
                wishes.map((wish) => (
                  <div
                    key={wish.id}
                    className="p-3.5 rounded-2xl bg-white/95 shadow-[0_4px_16px_rgba(0,0,0,0.22)] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-sans font-bold text-[#2e0854] truncate">
                        {wish.name}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffe4e6] text-[#e11d48] text-[10px] font-sans font-bold">
                          <Heart className="w-2.5 h-2.5 fill-[#e11d48] text-[#e11d48]" />
                          {wish.loveCount ?? 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteWish(wish.id)}
                          title="Delete wish"
                          className="p-1 rounded-full text-[#6b21a8]/45 hover:text-[#e11d48] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-sans text-[#4c1d95] leading-relaxed break-words">
                      {wish.message}
                    </p>

                    <div className="text-[10px] font-sans text-[#7e22ce]/65">
                      {wish.createdAt}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
