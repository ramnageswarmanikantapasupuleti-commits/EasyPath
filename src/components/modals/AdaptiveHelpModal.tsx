import React, { useEffect } from 'react';
import { HelpCircle, RefreshCw, Sparkles, Phone, X, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSpeech } from '../../hooks/useSpeech';

export const AdaptiveHelpModal: React.FC = () => {
  const { showAdaptiveModal, setShowAdaptiveModal, resetStruggle, profile, settings } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  useEffect(() => {
    if (showAdaptiveModal && settings.autoRead) {
      speak('Do you need help? You can try again, make instructions simpler, or call your helper.');
    }
  }, [showAdaptiveModal]);

  if (!showAdaptiveModal) return null;

  const handleClose = () => {
    resetStruggle();
    setShowAdaptiveModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-2xl border-2 border-[#4A90D9]/30 text-center">
        {/* Friendly Reassuring Character / Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#4A90D9] flex items-center justify-center mb-4">
          <HelpCircle className="w-10 h-10" />
        </div>

        <h3 className="font-heading font-extrabold text-2xl text-gray-900 dark:text-white mb-2">
          Do you need some help?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-base mb-6 leading-relaxed">
          It is completely okay to take your time. What would feel best right now?
        </p>

        {/* 3 Large Action Buttons (Touch target >= 56px) */}
        <div className="space-y-3">
          <button
            onClick={handleClose}
            className="w-full min-h-[56px] px-5 py-3 rounded-2xl bg-[#4A90D9] hover:bg-[#2C5F8A] text-white font-bold text-base flex items-center justify-center gap-3 shadow transition active:scale-98"
          >
            <RefreshCw className="w-5 h-5 shrink-0" />
            <span>I want to try this step again</span>
          </button>

          <button
            onClick={() => {
              speak('Take a slow, deep breath. Read one word at a time, or tap the speaker button to hear it.');
              handleClose();
            }}
            className="w-full min-h-[56px] px-5 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold text-base flex items-center justify-center gap-3 transition active:scale-98"
          >
            <Sparkles className="w-5 h-5 text-[#F5A623] shrink-0" />
            <span>Read it more slowly for me</span>
          </button>

          <a
            href={`tel:${profile.caregiverPhone}`}
            onClick={handleClose}
            className="w-full min-h-[56px] px-5 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold text-base flex items-center justify-center gap-3 transition active:scale-98"
          >
            <Phone className="w-5 h-5 text-[#4CAF7D] shrink-0" />
            <span>Call helper {profile.caregiverName}</span>
          </a>
        </div>

        <button
          onClick={handleClose}
          className="mt-5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2 px-4 rounded-xl"
        >
          I'm okay, close this
        </button>
      </div>
    </div>
  );
};
