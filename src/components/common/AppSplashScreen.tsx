import React, { useEffect, useState } from 'react';
import { ArrowRight, Volume2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playGentleChime } from '../../hooks/useSpeech';

interface AppSplashScreenProps {
  onComplete?: () => void;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({ onComplete }) => {
  const { showSplash, setShowSplash, settings } = useApp();
  const [animStage, setAnimStage] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  // Check user preference for reduced motion
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  useEffect(() => {
    if (!showSplash) return;

    if (prefersReducedMotion) {
      setAnimStage(4);
      return;
    }

    // Sequence stages
    const t1 = setTimeout(() => {
      setAnimStage(1); // Stone 1
      if (settings?.soundFeedback) playGentleChime('chime');
    }, 200);

    const t2 = setTimeout(() => {
      setAnimStage(2); // Stone 2
    }, 550);

    const t3 = setTimeout(() => {
      setAnimStage(3); // Stone 3
    }, 900);

    const t4 = setTimeout(() => {
      setAnimStage(4); // Orange Sun & Title
      if (settings?.soundFeedback) playGentleChime('success');
    }, 1300);

    // Auto-dismiss after 2.8 seconds
    const tDismiss = setTimeout(() => {
      handleDismiss();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tDismiss);
    };
  }, [showSplash, prefersReducedMotion]);

  const handleDismiss = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    try {
      sessionStorage.setItem('easypath_seen_intro_v2', 'true');
    } catch {}

    setTimeout(() => {
      setShowSplash(false);
      setIsFadingOut(false);
      if (onComplete) onComplete();
    }, 450);
  };

  if (!showSplash) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="EasyPath Welcome Intro"
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 select-none cursor-pointer transition-opacity duration-500 bg-[#0f766e] text-[#fff7e0] ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Quiet Header */}
      <div className="w-full max-w-md flex items-center justify-between pt-2 text-xs font-semibold tracking-wider uppercase text-[#fff7e0]/80">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#fb923c] animate-ping" />
          EasyPath
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="px-3 py-1 rounded-full bg-[#0d645e] hover:bg-[#0b544e] text-[#fff7e0] text-xs font-medium border border-[#fff7e0]/20 transition"
        >
          Skip intro
        </button>
      </div>

      {/* Main Animated Icon Centerpiece */}
      <div className="flex flex-col items-center justify-center my-auto w-full max-w-sm text-center">
        {/* Animated App Icon Canvas */}
        <div className="relative w-56 h-48 sm:w-64 sm:h-56 rounded-3xl p-4 bg-[#0d645e]/50 border border-[#fff7e0]/15 shadow-2xl overflow-hidden mb-6 flex items-center justify-center backdrop-blur-xs">
          {/* Subtle Guiding Curve Line */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1170 991"
            fill="none"
          >
            <path
              d="M 326 842 C 450 780, 600 700, 738 630 C 650 500, 520 440, 462 366 C 550 250, 720 200, 838 160"
              stroke="#fff7e0"
              strokeWidth="18"
              strokeDasharray="24 24"
              strokeLinecap="round"
              className={`transition-opacity duration-1000 ${animStage >= 2 ? 'opacity-35' : 'opacity-0'}`}
            />
          </svg>

          {/* Stepping Stone 1: Bottom-Left Cream */}
          <div
            style={{ left: '26%', bottom: '12%' }}
            className={`absolute w-12 h-12 sm:w-14 sm:h-14 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#fff7e0] shadow-md transition-all duration-500 ${
              animStage >= 1
                ? 'scale-100 opacity-100'
                : 'scale-0 opacity-0'
            }`}
          />

          {/* Stepping Stone 2: Mid-Right Cream */}
          <div
            style={{ left: '64%', bottom: '36%' }}
            className={`absolute w-14 h-14 sm:w-16 sm:h-16 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#fff7e0] shadow-md transition-all duration-500 delay-75 ${
              animStage >= 2
                ? 'scale-100 opacity-100'
                : 'scale-0 opacity-0'
            }`}
          />

          {/* Stepping Stone 3: Mid-Left Cream */}
          <div
            style={{ left: '38%', top: '38%' }}
            className={`absolute w-11 h-11 sm:w-12 sm:h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff7e0] shadow-md transition-all duration-500 delay-100 ${
              animStage >= 3
                ? 'scale-100 opacity-100'
                : 'scale-0 opacity-0'
            }`}
          />

          {/* Stepping Stone 4: Top-Right Vibrant Orange Sun (Goal/Guide) */}
          <div
            style={{ left: '74%', top: '16%' }}
            className={`absolute w-12 h-12 sm:w-14 sm:h-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fb923c] shadow-lg transition-all duration-700 ${
              animStage >= 4
                ? 'scale-100 opacity-100'
                : 'scale-0 opacity-0'
            }`}
          >
            {/* Gentle Radial Aura when Orange Sun shines */}
            {animStage >= 4 && (
              <span className="absolute -inset-2.5 rounded-full bg-[#fb923c]/40 animate-ping pointer-events-none" />
            )}
          </div>
        </div>

        {/* Title & Tagline with Calm Reveal */}
        <div
          className={`space-y-2 transition-all duration-700 ${
            animStage >= 4
              ? 'translate-y-0 opacity-100'
              : 'translate-y-3 opacity-0'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-[#fff7e0]">
            EasyPath
          </h1>
          <p className="text-sm sm:text-base font-medium text-[#fff7e0]/90 max-w-xs mx-auto leading-snug">
            Calm, clear steps for everyday independence.
          </p>
        </div>

        {/* Stage Status / Reassurance Micro-copy */}
        <div className="h-6 mt-4 flex items-center justify-center">
          <p className="text-xs font-semibold text-[#fff7e0]/70 transition-opacity duration-300">
            {animStage === 1 && 'Breathe gently...'}
            {animStage === 2 && 'One simple step at a time...'}
            {animStage === 3 && 'Always guided, never alone...'}
            {animStage >= 4 && 'Ready for you.'}
          </p>
        </div>
      </div>

      {/* Bottom Action Button & Skip Notice */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2 pb-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className={`w-full py-3.5 px-6 rounded-2xl bg-[#fb923c] hover:bg-[#f97316] text-[#0f766e] font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 ${
            animStage >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <span>Open My Day</span>
          <ArrowRight className="w-4 h-4 text-[#0f766e]" />
        </button>
        <span className="text-[11px] text-[#fff7e0]/60">
          Tap anywhere on screen to begin
        </span>
      </div>
    </div>
  );
};
