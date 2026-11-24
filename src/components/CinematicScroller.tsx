import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import confetti from 'canvas-confetti';
import { MapPin, Download, Share2, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const getFramePath = (index: number) => {
  const paddedIndex = String(index).padStart(4, '0');
  return `/frames/frame_${paddedIndex}.webp`;
};

export const CinematicScroller: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const finalCardRef = useRef<HTMLImageElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
  const leftActionsRef = useRef<HTMLDivElement | null>(null);
  const rightActionsRef = useRef<HTMLDivElement | null>(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [totalFrames, setTotalFrames] = useState(0);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const hasCelebratedRef = useRef(false);

  // 1. Fetch manifest & preload all lossless frames + final card image
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
          setLoadProgress(Math.round((loadedCount / totalItems) * 100));
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

  // 2. High-Performance Motion Loop (Dual-Frame Blending + Seamless Final Card Merge)
  useEffect(() => {
    if (!isLoaded || !canvasRef.current || !containerRef.current || totalFrames === 0) return;

    // A. Lenis smooth momentum scroller
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const playhead = { frame: 0 };

    // B. Crystal Clear 100% Native Edge-to-Edge Buffer
    const resizeCanvas = () => {
      if (!containerRef.current || !canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
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

    // Initial first-frame render
    render(0);

    // D. Master Cinematic Scroll Timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=400%',
        pin: true,
        scrub: 0.25,
        onUpdate: (self) => {
          // Trigger celebratory petals once when reaching the final merged card
          if (self.progress > 0.88 && !hasCelebratedRef.current) {
            hasCelebratedRef.current = true;
            confetti({
              particleCount: 40,
              spread: 70,
              origin: { y: 0.85 },
              colors: ['#7e22ce', '#a855f7', '#d8b4fe', '#f3e8ff', '#fef08a'],
              disableForReducedMotion: true,
            });
          } else if (self.progress < 0.75) {
            hasCelebratedRef.current = false;
          }
        },
      },
    });

    // 1. Initial scroll prompt fades away on first gesture
    if (hintRef.current) {
      tl.to(
        hintRef.current,
        {
          opacity: 0,
          y: 20,
          ease: 'power1.out',
          duration: 0.35,
        },
        0
      );
    }

    // 2. Video frames scrub through the entire animated invitation
    tl.to(
      playhead,
      {
        frame: totalFrames - 1,
        ease: 'none',
        duration: 3.2,
        onUpdate: () => {
          render(playhead.frame);
        },
      },
      0
    );

    // 3. Final Card Merging:
    // Crossfades into the ultra-sharp, uncompressed full-screen card
    // as the video settles at its conclusion (merging into the still image)
    if (finalCardRef.current) {
      tl.fromTo(
        finalCardRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: 'power2.inOut',
          duration: 0.85,
        },
        2.55 // overlaps gracefully with the animation finale
      );
    }

    // 4. Interactive Side Floating Buttons glide in when invitation is fully merged
    if (leftActionsRef.current) {
      tl.fromTo(
        leftActionsRef.current,
        { opacity: 0, x: -25, pointerEvents: 'none' },
        {
          opacity: 1,
          x: 0,
          pointerEvents: 'auto',
          ease: 'power2.out',
          duration: 0.55,
        },
        3.35
      );
    }

    if (rightActionsRef.current) {
      tl.fromTo(
        rightActionsRef.current,
        { opacity: 0, x: 25, pointerEvents: 'none' },
        {
          opacity: 1,
          x: 0,
          pointerEvents: 'auto',
          ease: 'power2.out',
          duration: 0.55,
        },
        3.35
      );
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isLoaded, totalFrames]);

  // Save Card to Photos
  const handleSaveCard = () => {
    const link = document.createElement('a');
    link.href = '/images/final_card.jpg';
    link.download = 'Suvarna_Rajesh_Engagement_Invitation.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Maps Directions
  const handleGetDirections = () => {
    window.open(
      'https://www.google.com/maps/search/?api=1&query=Vemulawada+Sri+Raja+Rajeshwara+Swamy+Temple',
      '_blank',
      'noopener,noreferrer'
    );
  };

  // Share Invitation
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Engagement Ceremony: Suvarna & Rajesh',
          text: 'You are warmly invited to celebrate the engagement of Suvarna and Rajesh on 26th November at 08 AM in Vemulawada.',
          url: window.location.href,
        });
      } catch {
        // User dismiss
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Invitation link copied to clipboard!');
    }
  };

  return (
    <div className="relative bg-white text-[#2b0b3f] min-h-screen">
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white space-y-4">
          <div className="w-14 h-14 rounded-full border-2 border-[#7e22ce]/20 border-t-[#7e22ce] animate-spin" />
          <span className="font-heading text-xl text-[#3b0764] text-center px-4 font-semibold tracking-normal">
            {totalFrames === 0 ? "Preparing Invitation" : "Loading Invitation"}
          </span>
          {totalFrames > 0 && (
            <span className="text-xs font-sans text-[#7e22ce] font-medium tracking-normal">
              {loadProgress}% Preloaded
            </span>
          )}
        </div>
      )}

      {/* 
        Full-Screen Viewport (100% Edge-to-Edge)
        ZERO mobile borders, ZERO fake frames, ZERO notches — purely full-bleed
      */}
      <div
        ref={containerRef}
        className="relative w-full h-[100dvh] overflow-hidden bg-white"
      >
        {/* Full-Screen Video Canvas (Edge-to-Edge) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover block"
        />

        {/* 
          High-Resolution Final Merged Card Image (Edge-to-Edge)
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
          type="button"
          onClick={handleGetDirections}
          title="Click to find venue directions on Google Maps"
          className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-48 h-32 z-20 cursor-pointer rounded-2xl focus:outline-none transition-opacity opacity-0 hover:opacity-100 bg-purple-500/10 flex items-center justify-center pointer-events-auto"
        />

        {/* Initial Scroll Hint Indicator (Disappears immediately on scroll) */}
        <div
          ref={hintRef}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none transition-transform"
        >
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full apple-liquid-glass shadow-md">
            <span className="text-[11px] font-sans font-medium text-[#2e0854] tracking-normal">
              Scroll to explore invitation
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#7e22ce] animate-bounce" />
          </div>
        </div>

        {/* Left Side Floating Capsule: Directions & Share (Unified Apple Liquid Glass) */}
        <div
          ref={leftActionsRef}
          className="absolute left-2.5 sm:left-6 top-[54%] -translate-y-1/2 z-30 pointer-events-none opacity-0"
        >
          <div className="apple-liquid-glass w-[68px] sm:w-[76px] py-3 px-1 rounded-[32px] sm:rounded-[36px] flex flex-col items-center gap-1.5 pointer-events-auto shadow-2xl">
            {/* Directions */}
            <button
              type="button"
              onClick={handleGetDirections}
              title="Directions to Venue"
              className="apple-liquid-glass-btn w-full py-1.5 flex flex-col items-center justify-center cursor-pointer select-none text-[#2e0854] hover:text-[#7e22ce] group"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-0.5 group-hover:bg-white/20 transition-colors">
                <MapPin className="w-4.5 h-4.5 text-[#2e0854] group-hover:text-[#7e22ce] transition-colors" />
              </div>
              <span className="text-[9px] font-sans font-semibold tracking-normal text-[#2e0854] leading-tight">
                Directions
              </span>
            </button>

            {/* Delicate Glass Divider */}
            <div className="w-8 h-[1px] bg-white/35" />

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              title="Share Invitation"
              className="apple-liquid-glass-btn w-full py-1.5 flex flex-col items-center justify-center cursor-pointer select-none text-[#2e0854] hover:text-[#7e22ce] group"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-0.5 group-hover:bg-white/20 transition-colors">
                <Share2 className="w-4.5 h-4.5 text-[#2e0854] group-hover:text-[#7e22ce] transition-colors" />
              </div>
              <span className="text-[9px] font-sans font-semibold tracking-normal text-[#2e0854] leading-tight">
                Share
              </span>
            </button>
          </div>
        </div>

        {/* Right Side Floating Capsule: Download Card (Unified Apple Liquid Glass) */}
        <div
          ref={rightActionsRef}
          className="absolute right-2.5 sm:right-6 top-[62%] -translate-y-1/2 z-30 pointer-events-none opacity-0"
        >
          <div className="apple-liquid-glass w-[68px] sm:w-[76px] py-3.5 px-1 rounded-[32px] sm:rounded-[36px] flex flex-col items-center justify-center pointer-events-auto shadow-2xl">
            {/* Download Card */}
            <button
              type="button"
              onClick={handleSaveCard}
              title="Save Invitation Card"
              className="apple-liquid-glass-btn w-full py-1.5 flex flex-col items-center justify-center cursor-pointer select-none text-[#2e0854] hover:text-[#7e22ce] group"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-0.5 group-hover:bg-white/20 transition-colors">
                <Download className="w-4.5 h-4.5 text-[#2e0854] group-hover:text-[#7e22ce] transition-colors" />
              </div>
              <span className="text-[9px] font-sans font-semibold tracking-normal text-[#2e0854] leading-tight text-center">
                Save Card
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
