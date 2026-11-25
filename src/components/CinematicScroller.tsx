import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { MapPin, Download, Share2, Heart, X } from 'lucide-react';

interface PendingAction {
  type: 'directions' | 'share' | 'download';
  title: string;
  actionText: string;
  execute: () => void;
}

const getFramePath = (index: number) => {
  const paddedIndex = String(index).padStart(4, '0');
  return `/frames/frame_${paddedIndex}.webp`;
};

export const CinematicScroller: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const finalCardRef = useRef<HTMLImageElement | null>(null);
  const qrHotspotRef = useRef<HTMLButtonElement | null>(null);
  const leftActionsRef = useRef<HTMLDivElement | null>(null);
  const rightActionsRef = useRef<HTMLDivElement | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [totalFrames, setTotalFrames] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const hasCelebratedRef = useRef(false);
  const openTriggerRef = useRef<(() => void) | null>(null);

  // Background Music (SVSC Title BGM Loop) State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Heartfelt Action Confirmation Modal State
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [countdown, setCountdown] = useState(13);
  const [isClosing, setIsClosing] = useState(false);
  const isClosingRef = useRef(false);
  const [typedText, setTypedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [clickOrigin, setClickOrigin] = useState<{ x: number; y: number } | null>(null);

  // 1. Continuous Background Music (SVSC Title BGM) with Multi-Format Support & Aggressive Autoplay
  const unlockAndPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Resume Web Audio AudioContext if available (unlocks iOS audio pipeline)
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
      }
    } catch {}

    audio.muted = false;
    audio.volume = 0.85;
    if (audio.paused) {
      audio.play().then(() => {
        setIsAudioPlaying(true);
      }).catch((err) => {
        console.warn('Awaiting user gesture for unmuted audio:', err);
      });
    } else {
      setIsAudioPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const tryAutoplayUnmuted = () => {
      audio.muted = false;
      audio.volume = 0.85;
      audio.play().then(() => {
        setIsAudioPlaying(true);
      }).catch(() => {
        // Browser blocked unmuted autoplay before gesture: pre-warm muted stream so first interaction unmutes instantaneously
        audio.muted = true;
        audio.play().catch(() => {});
      });
    };

    // Attempt direct unmuted autoplay immediately on mount and once media is ready
    tryAutoplayUnmuted();
    audio.addEventListener('canplaythrough', tryAutoplayUnmuted, { once: true });

    // Listen to audio state events (only mark playing once unmuted)
    const onPlay = () => {
      if (!audio.muted) setIsAudioPlaying(true);
    };
    const onPause = () => setIsAudioPlaying(false);
    const onVolumeChange = () => {
      if (!audio.paused && !audio.muted) setIsAudioPlaying(true);
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('volumechange', onVolumeChange);

    // Unlock and unmute on the very first gesture anywhere on the screen
    const activationEvents = ['click', 'touchstart', 'touchend', 'touchmove', 'pointerdown', 'wheel', 'keydown'];
    activationEvents.forEach((ev) => {
      window.addEventListener(ev, unlockAndPlay, { passive: true });
      document.addEventListener(ev, unlockAndPlay, { passive: true });
    });

    return () => {
      audio.removeEventListener('canplaythrough', tryAutoplayUnmuted);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('volumechange', onVolumeChange);
      activationEvents.forEach((ev) => {
        window.removeEventListener(ev, unlockAndPlay);
        document.removeEventListener(ev, unlockAndPlay);
      });
    };
  }, []);

  // Retry unmuted autoplay once all invitation assets finish loading
  useEffect(() => {
    if (isLoaded) {
      unlockAndPlay();
    }
  }, [isLoaded]);

  // 2. Fetch manifest & preload all lossless frames + final card image
  useEffect(() => {
    let isCancelled = false;

    async function loadManifestAndImages() {
      try {
        const res = await fetch('/frames/manifest.json');
        if (!res.ok) return;
        const data = await res.json();
        const frameCount = data.totalFrames || 0;
        if (frameCount === 0) return;

        setTotalFrames(frameCount);

        let loadedCount = 0;
        const totalItems = frameCount + 1; // Frames + Final Merged Card
        const images: HTMLImageElement[] = new Array(frameCount);

        const checkProgress = () => {
          if (isCancelled) return;
          loadedCount++;
          if (loadedCount >= totalItems) {
            imagesRef.current = images;
            setIsLoaded(true);
          }
        };

        // Preload video frames
        for (let i = 1; i <= frameCount; i++) {
          if (isCancelled) return;
          const img = new Image();
          img.src = getFramePath(i);

          if (typeof img.decode === 'function') {
            img.decode().then(checkProgress).catch(checkProgress);
          } else {
            img.onload = checkProgress;
            img.onerror = checkProgress;
          }

          images[i - 1] = img;
        }

        // Preload final high-resolution merged card
        const cardImg = new Image();
        cardImg.src = '/images/final_card_1080.webp';
        if (typeof cardImg.decode === 'function') {
          cardImg.decode().then(checkProgress).catch(checkProgress);
        } else {
          cardImg.onload = checkProgress;
          cardImg.onerror = checkProgress;
        }
      } catch (e) {
        console.warn("Waiting for invitation assets...", e);
      }
    }

    loadManifestAndImages();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Stationary Viewport + Slow Scroll-Triggered Auto-Play Reveal
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current || totalFrames === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const playhead = { frame: 0 };

    // B. Crystal Clear 100% Native Edge-to-Edge Buffer (Stationary Viewport)
    const resizeCanvas = () => {
      if (!containerRef.current || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;

      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      render(playhead.frame);
    };

    // C. Dual-Frame Blending Engine (Smooth 120 FPS Sub-pixel Transition)
    const render = (frameFloat: number) => {
      const clamped = Math.max(0, Math.min(frameFloat, totalFrames - 1));
      const floorIdx = Math.floor(clamped);
      const ceilIdx = Math.min(floorIdx + 1, totalFrames - 1);
      const subFrameAlpha = clamped - floorIdx;

      const imgA = imagesRef.current[floorIdx];
      const imgB = imagesRef.current[ceilIdx];
      if (!imgA || !imgA.complete) return;

      const cw = canvas.width;
      const ch = canvas.height;

      // Fill background buffer so no white gap or line can ever appear
      ctx.fillStyle = '#0b0314';
      ctx.fillRect(0, 0, cw, ch);

      // Full edge-to-edge cover positioning
      const hRatio = cw / imgA.width;
      const vRatio = ch / imgA.height;
      const ratio = Math.max(hRatio, vRatio);
      const drawW = imgA.width * ratio;
      const drawH = imgA.height * ratio;
      const shiftX = (cw - drawW) * 0.5;
      const shiftY = (ch - drawH) * 0.5;

      // Draw primary base frame
      ctx.globalAlpha = 1.0;
      ctx.drawImage(imgA, 0, 0, imgA.width, imgA.height, shiftX, shiftY, drawW, drawH);

      // Micro-blend next frame during deceleration
      if (subFrameAlpha > 0.01 && imgB && imgB.complete && floorIdx !== ceilIdx) {
        ctx.globalAlpha = subFrameAlpha;
        ctx.drawImage(imgB, 0, 0, imgB.width, imgB.height, shiftX, shiftY, drawW, drawH);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    window.visualViewport?.addEventListener('resize', resizeCanvas);

    // Initial first-frame render (sealed envelope)
    render(0);

    // D. Paused Cinematic Reveal Timeline (Starts slowly on first scroll/swipe)
    const tl = gsap.timeline({ paused: true });

    // 1. Slow, graceful video playback through all frames
    tl.to(
      playhead,
      {
        frame: totalFrames - 1,
        ease: 'power1.inOut',
        duration: 9.5,
        onUpdate: () => {
          render(playhead.frame);
        },
      },
      0
    );

    // 2. Final Card Merging: Crossfades into the ultra-sharp, uncompressed card
    if (finalCardRef.current) {
      tl.fromTo(
        finalCardRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'power2.inOut',
          duration: 1.8,
        },
        7.8
      );
    }

    // 3. Celebratory petals when the final card is revealed
    tl.call(
      () => {
        if (!hasCelebratedRef.current) {
          hasCelebratedRef.current = true;
          confetti({
            particleCount: 50,
            spread: 75,
            origin: { y: 0.85 },
            colors: ['#7e22ce', '#a855f7', '#d8b4fe', '#f3e8ff', '#fef08a'],
            disableForReducedMotion: true,
          });
        }
      },
      [],
      8.6
    );

    // 4. Enable QR hotspot & glide in side floating buttons at card reveal
    if (qrHotspotRef.current) {
      tl.set(qrHotspotRef.current, { pointerEvents: 'auto' }, 9.2);
    }

    if (leftActionsRef.current) {
      tl.fromTo(
        leftActionsRef.current,
        { opacity: 0, x: -30, pointerEvents: 'none' },
        {
          opacity: 1,
          x: 0,
          pointerEvents: 'auto',
          ease: 'power2.out',
          duration: 0.9,
        },
        9.2
      );
    }

    if (rightActionsRef.current) {
      tl.fromTo(
        rightActionsRef.current,
        { opacity: 0, x: 30, pointerEvents: 'none' },
        {
          opacity: 1,
          x: 0,
          pointerEvents: 'auto',
          ease: 'power2.out',
          duration: 0.9,
        },
        9.2
      );
    }

    // Trigger slow auto-play once on user's first scroll, swipe, or seal tap
    let hasStarted = false;
    const triggerAutoPlay = () => {
      unlockAndPlay();
      if (hasStarted) return;
      hasStarted = true;
      setHasOpened(true);
      tl.play();
    };
    openTriggerRef.current = triggerAutoPlay;

    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'Space', 'PageDown', 'Enter'].includes(e.code)) {
        triggerAutoPlay();
      }
    };

    const triggerEvents = ['wheel', 'touchmove', 'touchend', 'click', 'pointerdown'] as const;
    triggerEvents.forEach((ev) => {
      window.addEventListener(ev, triggerAutoPlay, { passive: true });
    });
    window.addEventListener('keydown', onKeyDown, { passive: true });

    return () => {
      openTriggerRef.current = null;
      tl.kill();
      triggerEvents.forEach((ev) => {
        window.removeEventListener(ev, triggerAutoPlay);
      });
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
      window.visualViewport?.removeEventListener('resize', resizeCanvas);
    };
  }, [isLoaded, totalFrames]);

  // Realistic Typing Animation with Emotional Typo & 8-Letter Backspace
  useEffect(() => {
    if (!pendingAction) {
      setTypedText('');
      setIsTypingDone(false);
      return;
    }

    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const prefix = 'Your action shows us so much love and support. Your presence means ';
    const typo = 'so much '; // Exactly 8 characters
    const suffix = 'everything to us, and we are wishing and praying to see you celebrate with us at Vemulawada!';

    let phase:
      | 'typing_prefix'
      | 'typing_typo'
      | 'pause_before_backspace'
      | 'backspacing'
      | 'pause_before_resume'
      | 'typing_suffix'
      | 'done' = 'typing_prefix';

    let charIndex = 0;
    let currentText = '';

    const step = () => {
      if (isCancelled) return;

      if (phase === 'typing_prefix') {
        if (charIndex < prefix.length) {
          currentText += prefix[charIndex];
          setTypedText(currentText);
          charIndex++;
          timeoutId = setTimeout(step, 48);
        } else {
          phase = 'typing_typo';
          charIndex = 0;
          timeoutId = setTimeout(step, 55);
        }
      } else if (phase === 'typing_typo') {
        if (charIndex < typo.length) {
          currentText += typo[charIndex];
          setTypedText(currentText);
          charIndex++;
          timeoutId = setTimeout(step, 52);
        } else {
          phase = 'pause_before_backspace';
          timeoutId = setTimeout(step, 650); // Thoughtful pause before backspace
        }
      } else if (phase === 'pause_before_backspace') {
        phase = 'backspacing';
        timeoutId = setTimeout(step, 75);
      } else if (phase === 'backspacing') {
        if (currentText.length > prefix.length) {
          currentText = currentText.slice(0, -1);
          setTypedText(currentText);
          timeoutId = setTimeout(step, 75); // Deliberate, graceful 8-letter deletion
        } else {
          phase = 'pause_before_resume';
          timeoutId = setTimeout(step, 400); // Pause before typing true sentiment
        }
      } else if (phase === 'pause_before_resume') {
        phase = 'typing_suffix';
        charIndex = 0;
        timeoutId = setTimeout(step, 55);
      } else if (phase === 'typing_suffix') {
        if (charIndex < suffix.length) {
          currentText += suffix[charIndex];
          setTypedText(currentText);
          charIndex++;
          timeoutId = setTimeout(step, 46);
        } else {
          phase = 'done';
          setIsTypingDone(true);
        }
      }
    };

    // Begin typing calmly after slow 1.25s modal expansion settles
    timeoutId = setTimeout(step, 1100);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [pendingAction]);

  // Smooth Dismissal or Action Execution with Exit Animation
  const handleCloseModal = (shouldExecuteAction: boolean) => {
    if (isClosingRef.current || !pendingAction) return;
    isClosingRef.current = true;
    setIsClosing(true);

    const actionToRun = shouldExecuteAction ? pendingAction.execute : null;

    // Execute user-gesture-dependent action (navigator.share, window.open, download)
    // synchronously so browser security permits the share dialog without delay
    if (actionToRun) {
      actionToRun();
    }

    setTimeout(() => {
      setPendingAction(null);
      setIsClosing(false);
      setClickOrigin(null);
      isClosingRef.current = false;
    }, 450);
  };

  // Heartfelt Action Countdown Timer (10 Seconds)
  useEffect(() => {
    if (!pendingAction || isClosing) return;

    if (countdown <= 0) {
      handleCloseModal(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pendingAction, countdown, isClosing]);

  // Save Card to Photos (Ultra HD 1080x1920 Lossless Studio Quality)
  const handleSaveCardReal = () => {
    const link = document.createElement('a');
    link.href = '/images/final_card.png';
    link.download = 'Suvarna_Rajesh_Engagement_Invitation.png';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 150);
  };

  // Google Maps Directions (Forces open without browser popup blocker interference)
  const handleGetDirectionsReal = () => {
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=V4HW%2BRX4+Vemulawada%2C+Andhra+Pradesh';
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.assign(mapsUrl);
    } else {
      const win = window.open(mapsUrl, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.assign(mapsUrl);
      }
    }
  };

  // Share Invitation (Native Share Sheet with Reliable Clipboard Fallback)
  const handleShareReal = async () => {
    const shareData = {
      title: 'Engagement Ceremony: Suvarna & Rajesh',
      text: 'You are warmly invited to celebrate the engagement of Suvarna and Rajesh on 26th November at 08 AM in Vemulawada.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: unknown) {
        const error = err as Error;
        if (error?.name === 'AbortError') {
          return;
        }
        console.warn('Native share failed or gesture expired:', err);
      }
    }

    // Fallback: Copy invitation URL to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Invitation link copied to clipboard!');
    } catch {
      prompt('Copy invitation link:', window.location.href);
    }
  };

  // Trigger Liquid Glass Popup before action execution (Redirect happens AFTER popup ends)
  const triggerActionWithModal = (
    type: 'directions' | 'share' | 'download',
    event?: React.MouseEvent
  ) => {
    if (event) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      setClickOrigin({ x, y });
    } else {
      setClickOrigin(null);
    }

    let title = 'Venue Directions';
    let actionText = 'Opening Google Maps in';
    let execute = handleGetDirectionsReal;

    if (type === 'download') {
      title = 'Invitation Card';
      actionText = 'Downloading your card in';
      execute = handleSaveCardReal;
    } else if (type === 'share') {
      title = 'Share Invitation';
      actionText = 'Opening share sheet in';
      execute = handleShareReal;
    }

    setCountdown(13);
    setIsClosing(false);
    isClosingRef.current = false;
    setPendingAction({ type, title, actionText, execute });
  };

  return (
    <div className="relative bg-[#0b0314] text-[#2b0b3f] h-[100dvh] w-full overflow-hidden">
      {/* 
        Luxury Shimmer Loading Overlay
        Featuring Shimmering Names "SUVARNA ❤️ RAJESH" with Radiant Heart Love Icon
      */}
      {!isLoaded && (
        <div 
          onClick={unlockAndPlay}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0314] cursor-pointer"
        >
          <div className="w-full max-w-[440px] h-full min-h-[100dvh] bg-white flex flex-col items-center justify-center p-6 shadow-2xl relative overflow-hidden select-none">
            {/* Subtle Royal Aura Background */}
            <div className="absolute top-1/4 -left-12 w-64 h-64 bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-12 w-64 h-64 bg-pink-100/50 rounded-full blur-3xl pointer-events-none" />

            {/* Central Shimmer Content: Pure Shimmering Couple Names */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              {/* Shimmering Couple Names with Animated Love Heart Icon */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-nowrap">
                <span className="name-shimmer font-heading text-2xl sm:text-3xl font-bold tracking-wider">
                  SUVARNA
                </span>

                <div className="relative flex items-center justify-center px-1">
                  <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-[#9333ea] fill-[#a855f7] animate-pulse drop-shadow-[0_0_12px_rgba(168,85,247,0.7)]" />
                  <span className="absolute inset-0 rounded-full bg-purple-400/20 blur-xs animate-ping pointer-events-none" />
                </div>

                <span className="name-shimmer font-heading text-2xl sm:text-3xl font-bold tracking-wider">
                  RAJESH
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        Stationary Full-Screen Viewport (Mobile-Locked Format, Max 440px on Desktop)
        Frame holder never moves or changes size on scroll
      */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[440px] h-[100dvh] overflow-hidden bg-[#0b0314] shadow-[0_0_80px_rgba(0,0,0,0.85)] select-none mx-auto"
      >
        {/* Continuous Background Music Stream (Dual Native AAC & MP3 for 100% Mobile Compatibility) */}
        <audio
          ref={audioRef}
          autoPlay
          loop
          preload="auto"
          playsInline
        >
          <source src="/audio/bgm.m4a" type="audio/mp4" />
          <source src="/audio/bgm.mp3" type="audio/mpeg" />
        </audio>

        {/* Full-Screen First-Tap Audio Unlock Hotspot (Disappears instantly once playing) */}
        {!isAudioPlaying && (
          <div
            onClick={() => openTriggerRef.current?.()}
            className="absolute inset-0 z-20 cursor-pointer pointer-events-auto"
          />
        )}

        {/* Opening Liquid Glass Seal Button: Click to Open Invitation & Start Music */}
        <button
          type="button"
          onClick={() => {
            unlockAndPlay();
            openTriggerRef.current?.();
          }}
          className={`absolute left-1/2 top-[67%] -translate-x-1/2 -translate-y-1/2 z-30 apple-liquid-glass px-5 py-2.5 rounded-full flex items-center gap-2 text-[#2e0854] hover:text-[#7e22ce] shadow-2xl cursor-pointer select-none transition-all duration-700 active:scale-95 whitespace-nowrap ${
            hasOpened
              ? 'opacity-0 scale-95 pointer-events-none'
              : 'opacity-100 scale-100 pointer-events-auto'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-[#7e22ce] fill-[#7e22ce] animate-pulse" />
          <span className="text-xs font-sans font-semibold tracking-wide text-[#2e0854]">
            Tap to Open Invitation
          </span>
        </button>

        {/* Full-Screen Video Canvas (Stationary Edge-to-Edge) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover block pointer-events-none"
        />

        {/* 
          High-Resolution Final Merged Card Image (Stationary Edge-to-Edge)
          Crossfades smoothly over the canvas when the video animation completes
        */}
        <img
          ref={finalCardRef}
          src="/images/final_card_1080.webp"
          alt="Engagement Invitation - Suvarna & Rajesh"
          className="absolute inset-0 w-full h-full object-cover block pointer-events-none opacity-0 z-10 will-change-opacity select-none"
        />

        {/* QR Code Touch Hotspot (Opens Directions to Vemulawada) */}
        <button
          ref={qrHotspotRef}
          type="button"
          onClick={(e) => triggerActionWithModal('directions', e)}
          title="Click to find venue directions on Google Maps"
          className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-48 h-32 z-20 cursor-pointer rounded-2xl focus:outline-none transition-opacity opacity-0 hover:opacity-100 bg-purple-500/10 flex items-center justify-center pointer-events-none"
        />



        {/* Left Side Floating Capsule: Directions & Share (Edge Flush Downward Slanted Pill with Straight Vertical Icons) */}
        <div
          ref={leftActionsRef}
          className="absolute left-0 top-[52%] -translate-y-1/2 z-30 pointer-events-none opacity-0"
        >
          <div className="apple-liquid-glass w-[68px] sm:w-[74px] py-4 pr-3 pl-3 rounded-r-[32px] rounded-l-none border-l-0 skew-y-[18deg] origin-left shadow-2xl transition-all pointer-events-auto">
            {/* Unskewed Vertical Layout: Icons are in a 100% straight vertical line */}
            <div className="-skew-y-[18deg] flex flex-col items-center justify-center gap-2.5">
              {/* Directions Icon (Darker Royal Purple with Lavender Hover) */}
              <button
                type="button"
                onClick={(e) => triggerActionWithModal('directions', e)}
                title="Directions to Venue"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/35 hover:bg-white/55 shadow-sm transition-colors cursor-pointer text-[#2e0854] hover:text-[#7e22ce] active:scale-95"
              >
                <MapPin className="w-5 h-5 text-[#2e0854] hover:text-[#7e22ce] transition-colors" />
              </button>

              {/* Delicate Glass Divider */}
              <div className="w-6 h-[1px] bg-purple-900/15" />

              {/* Share Icon (Darker Royal Purple with Lavender Hover) */}
              <button
                type="button"
                onClick={(e) => triggerActionWithModal('share', e)}
                title="Share Invitation"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/35 hover:bg-white/55 shadow-sm transition-colors cursor-pointer text-[#2e0854] hover:text-[#7e22ce] active:scale-95"
              >
                <Share2 className="w-5 h-5 text-[#2e0854] hover:text-[#7e22ce] transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Floating Capsule: Download (Edge Cut-Off Cross Pill with Pronounced Upward Bend & Icon Only) */}
        <div
          ref={rightActionsRef}
          className="absolute -right-3 sm:-right-4 top-[62%] -translate-y-1/2 z-30 pointer-events-none opacity-0"
        >
          <button
            type="button"
            onClick={(e) => triggerActionWithModal('download', e)}
            title="Save Invitation Card"
            className="apple-liquid-glass w-[78px] sm:w-[86px] h-[58px] sm:h-[64px] rounded-l-[32px] rounded-r-none border-r-0 flex items-center justify-start pl-3.5 cursor-pointer select-none text-[#2e0854] hover:text-[#7e22ce] active:scale-95 pointer-events-auto shadow-2xl rotate-[24deg] origin-right transition-all group"
          >
            {/* Unrotated Icon: Counter-rotated to stay perfectly upright */}
            <div className="-rotate-[24deg] w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white/35 group-hover:bg-white/55 shadow-sm transition-colors">
              <Download className="w-5 h-5 text-[#2e0854] group-hover:text-[#7e22ce] transition-colors" />
            </div>
          </button>
        </div>
      </div>

      {/* Heartfelt Clear Liquid Glass Popup Modal (Lavender Typography & Typing Animation) */}
      {pendingAction && (() => {
        const startX = clickOrigin ? Math.round(clickOrigin.x - window.innerWidth / 2) : 0;
        const startY = clickOrigin ? Math.round(clickOrigin.y - window.innerHeight / 2) : 0;

        return (
          <div 
            onClick={() => handleCloseModal(false)}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 popup-modal-backdrop ${
              isClosing ? 'closing' : 'entering'
            }`}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                '--start-x': `${startX}px`,
                '--start-y': `${startY}px`,
              } as React.CSSProperties}
              className={`w-full max-w-[340px] sm:max-w-[350px] h-[370px] p-5 sm:p-6 rounded-[30px] apple-liquid-glass-modal popup-modal-card relative shadow-2xl flex flex-col justify-between items-center text-center ${
                isClosing ? 'modal-exit-origin' : 'modal-enter-origin'
              }`}
            >
              {/* Close Button (No Border, Box Shadow Only) */}
              <button
                type="button"
                onClick={() => handleCloseModal(false)}
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center bg-white shadow-[0_2px_8px_rgba(46,8,84,0.12)] hover:shadow-[0_4px_12px_rgba(46,8,84,0.18)] text-[#581c87] hover:text-[#2e0854] transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-[#581c87]" />
              </button>

              {/* Top Section: Badge & Headline */}
              <div className="w-full flex flex-col items-center space-y-2">
                {/* Heart Badge (Delicate, Reduced Font Size) */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white shadow-[0_2px_8px_rgba(46,8,84,0.08)]">
                  <Heart className="w-3 h-3 text-[#7e22ce] fill-[#7e22ce]" />
                  <span className="text-[10px] font-sans font-semibold text-[#6b21a8] tracking-normal">
                    With Your Blessings
                  </span>
                </div>

                {/* Headline (Refined, Reduced Font Size) */}
                <h3 className="font-heading text-base sm:text-[17px] text-[#2e0854] font-semibold tracking-normal leading-snug drop-shadow-xs px-2">
                  Thank you for your warm love &amp; blessings
                </h3>
              </div>

              {/* Middle Section: Fixed-Height Emotional Message Container (Zero Card Resizing during Typing/Backspace) */}
              <div className="w-full h-[105px] flex items-center justify-center px-1">
                <p className="text-xs sm:text-[12.5px] font-sans text-[#4c1d95] font-medium leading-relaxed drop-shadow-xs text-center">
                  &ldquo;{typedText}&rdquo;
                  {!isTypingDone && (
                    <span className="inline-block w-0.5 h-3 ml-0.5 align-middle bg-[#7e22ce] animate-pulse" />
                  )}
                </p>
              </div>

              {/* Bottom Section: Signature & Clean Action Button (No Blinking Dot) */}
              <div className="w-full flex flex-col items-center space-y-2">
                {/* Couple Signature (Delicate, Reduced Font Size) */}
                <div className="text-xs sm:text-[13px] font-serif italic text-[#7e22ce] font-semibold">
                  — Suvarna &amp; Rajesh
                </div>

                {/* Timer & Execution Button (Action Executes After Popup Ends) */}
                <button
                  type="button"
                  onClick={() => handleCloseModal(true)}
                  title="Click to proceed immediately"
                  className="px-5 py-2 rounded-full bg-white shadow-[0_3px_14px_rgba(46,8,84,0.1)] hover:shadow-[0_5px_18px_rgba(46,8,84,0.16)] active:scale-98 text-[11px] font-sans font-medium text-[#581c87] transition-all cursor-pointer"
                >
                  <span>
                    {pendingAction.actionText} <strong className="text-[#2e0854] font-bold text-xs ml-1">{countdown}s</strong>
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
