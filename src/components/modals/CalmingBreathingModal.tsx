import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle, Volume2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playGentleChime } from '../../hooks/useSpeech';

export const CalmingBreathingModal: React.FC = () => {
  const { showCalmingModal, setShowCalmingModal, updateProfile, profile } = useApp();
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [counter, setCounter] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    if (!showCalmingModal) {
      setCyclesCompleted(0);
      setPhase('Inhale');
      setCounter(4);
      return;
    }

    playGentleChime('breathe');

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Advance phase
        if (phase === 'Inhale') {
          setPhase('Hold');
          return 4;
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          return 4;
        } else {
          setPhase('Inhale');
          setCyclesCompleted((c) => c + 1);
          playGentleChime('breathe');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showCalmingModal, phase]);

  if (!showCalmingModal) return null;

  const handleFinish = () => {
    playGentleChime('success');
    updateProfile({ points: profile.points + 5 });
    setShowCalmingModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#FAF8F5] dark:bg-[#1A2421] p-6 shadow-2xl border-2 border-[#68B28A]/40 text-center relative overflow-hidden">
        <button
          onClick={() => setShowCalmingModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#68B28A]/15 text-[#2C5F8A] dark:text-[#68B28A] text-xs font-bold mb-3">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Calm & Breathe</span>
        </div>

        <h3 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-white mb-1">
          Take a Gentle Breath
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
          Follow the soothing circle. There is no rush at all.
        </p>

        {/* Dynamic Breathing Circle */}
        <div className="relative flex items-center justify-center my-6 h-56">
          <div
            className={`w-48 h-48 rounded-full bg-gradient-to-tr from-[#68B28A]/20 via-[#4A90D9]/25 to-[#68B28A]/30 flex items-center justify-center transition-all duration-1000 ease-in-out ${
              phase === 'Inhale'
                ? 'scale-115 ring-8 ring-[#68B28A]/40'
                : phase === 'Hold'
                ? 'scale-115 ring-12 ring-[#4A90D9]/40'
                : 'scale-90 ring-4 ring-[#68B28A]/20'
            }`}
          >
            <div className="w-36 h-36 rounded-full bg-white dark:bg-[#121212] shadow-inner flex flex-col items-center justify-center">
              <span className="font-heading font-black text-2xl text-[#2C5F8A] dark:text-[#68B28A]">
                {phase}
              </span>
              <span className="font-mono text-3xl font-bold text-gray-700 dark:text-gray-200 mt-1">
                {counter}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-black/30 rounded-2xl p-3 mb-5 border border-[#E8E5DF] dark:border-gray-800">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {cyclesCompleted > 0
              ? `You have taken ${cyclesCompleted} deep, refreshing breaths.`
              : 'Feel your shoulders soften as you breathe.'}
          </p>
        </div>

        <button
          onClick={handleFinish}
          className="w-full min-h-[52px] px-6 py-3 rounded-2xl bg-[#68B28A] hover:bg-[#589d77] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md transition active:scale-98"
        >
          <CheckCircle className="w-5 h-5" />
          <span>I feel calmer now (+5 pts)</span>
        </button>
      </div>
    </div>
  );
};
