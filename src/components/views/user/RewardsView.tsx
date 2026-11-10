import React from 'react';
import {
  Trophy,
  Sparkles,
  Flame,
  Volume2,
  Lock,
  Heart,
  CheckCircle,
  Phone,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

export const RewardsView: React.FC = () => {
  const { profile, badges, settings } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const handleReadRewards = () => {
    speak(
      `You have ${profile.points} points and a ${profile.streakDays}-day streak! You have unlocked ${unlockedCount} badges on your trophy shelf.`
    );
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">
            My Rewards & Trophies
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Every step you complete earns points and badges
          </p>
        </div>

        <button
          onClick={handleReadRewards}
          className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#4A90D9] hover:bg-blue-100 touch-target"
          aria-label="Read rewards summary"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Points & Streak Card */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#4A90D9] to-[#2C5F8A] text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              Total Points
            </span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <span className="font-heading font-black text-4xl sm:text-5xl tracking-tight">
            {profile.points}
          </span>
          <span className="text-xs text-blue-100 mt-2 font-medium">
            Earned from tasks & practice
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#F5A623] to-[#E07A5F] text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
              Daily Streak
            </span>
            <Flame className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-black text-4xl sm:text-5xl tracking-tight">
            {profile.streakDays} <span className="text-2xl font-bold">Days</span>
          </span>
          <span className="text-xs text-amber-100 mt-2 font-medium">
            Streaks pause, never break!
          </span>
        </div>
      </div>

      {/* Trophy Shelf Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
            Trophy Shelf ({unlockedCount}/{badges.length} Unlocked)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 sm:p-5 rounded-3xl border transition flex items-start gap-4 ${
                badge.unlocked
                  ? 'bg-white dark:bg-[#1E293B] border-[#E8E5DF] dark:border-gray-800 shadow-xs'
                  : 'bg-gray-50/80 dark:bg-gray-800/40 border-dashed border-gray-200 dark:border-gray-700 opacity-60'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  badge.unlocked
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-[#F5A623] shadow-xs'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {badge.unlocked ? <Trophy className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading font-extrabold text-base text-gray-900 dark:text-white truncate">
                    {badge.title}
                  </h3>
                  {badge.unlocked && (
                    <span className="text-[10px] font-bold text-[#4CAF7D] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full shrink-0">
                      Unlocked
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-1.5">
                  {badge.description}
                </p>

                {badge.unlockedAt && (
                  <span className="text-[11px] font-medium text-gray-400">
                    Earned {badge.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
