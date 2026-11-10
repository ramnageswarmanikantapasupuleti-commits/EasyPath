import React, { useEffect } from 'react';
import { Phone, Heart, Check, MapPin, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSpeech } from '../../hooks/useSpeech';

export const LostEmergencyModal: React.FC = () => {
  const { isLostActive, cancelImLost, profile, settings } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  useEffect(() => {
    if (isLostActive) {
      speak(
        `It is completely okay. You are safe. Your helper ${profile.caregiverName} has been sent your location. Stay right where you are or tap the call button.`
      );
    }
  }, [isLostActive]);

  if (!isLostActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[#FAF8F5] dark:bg-[#1C1F26] p-6 shadow-2xl border-4 border-[#E8695A] text-center">
        {/* Calming Breathing Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-[#E8695A]/15 text-[#E8695A] flex items-center justify-center mb-4 animate-pulse">
          <Heart className="w-12 h-12 fill-current" />
        </div>

        <h2 className="font-heading font-black text-2xl text-gray-900 dark:text-white mb-2">
          It's okay. You are safe.
        </h2>
        <p className="text-gray-700 dark:text-gray-200 text-base mb-4 leading-relaxed font-medium">
          We have already sent your exact location to your helper,{' '}
          <strong>{profile.caregiverName}</strong>.
        </p>

        {/* Location Box */}
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 text-left mb-5">
          <MapPin className="w-5 h-5 text-[#E8695A] shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-gray-800 dark:text-gray-200 block">
              Shared GPS Location:
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Market St & 4th Ave, near Blue Cafe (Simulated live link)
            </span>
          </div>
        </div>

        {/* Direct Call Button */}
        <div className="space-y-3 mb-6">
          <a
            href={`tel:${profile.caregiverPhone}`}
            className="w-full min-h-[58px] px-6 py-3.5 rounded-2xl bg-[#4CAF7D] hover:bg-[#3d9366] text-white font-extrabold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-98 transition"
          >
            <Phone className="w-6 h-6 fill-current" />
            <span>Call {profile.caregiverName} Now</span>
          </a>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Phone: {profile.caregiverPhone}
          </p>
        </div>

        {/* Safe Dismiss Button */}
        <button
          onClick={cancelImLost}
          className="w-full min-h-[50px] px-5 py-2.5 rounded-2xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 text-gray-800 dark:text-gray-200 font-bold text-sm flex items-center justify-center gap-2 transition"
        >
          <Check className="w-4 h-4 text-[#4CAF7D]" />
          <span>I am okay now — Return to App</span>
        </button>
      </div>
    </div>
  );
};
