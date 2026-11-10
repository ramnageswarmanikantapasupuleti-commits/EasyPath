import React from 'react';
import {
  User,
  Heart,
  Phone,
  Settings,
  HelpCircle,
  Trophy,
  Flame,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

export const ProfileView: React.FC = () => {
  const { profile, tasks, setActiveView, settings } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  const completedToday = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Profile Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs text-center relative overflow-hidden">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-24 h-24 rounded-3xl object-cover mx-auto mb-3.5 ring-4 ring-[#4A90D9]/20 shadow-md"
        />

        <h1 className="font-heading font-black text-2xl text-gray-900 dark:text-white">
          {profile.name}
        </h1>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Preferred Name: "{profile.preferredName || profile.name}"
        </p>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <span className="font-heading font-black text-xl text-emerald-600 block">
              {completedToday}
            </span>
            <span className="text-[11px] font-bold text-gray-400">Done Today</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <span className="font-heading font-black text-xl text-[#F5A623] block">
              {profile.streakDays}d
            </span>
            <span className="text-[11px] font-bold text-gray-400">Streak</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800">
            <span className="font-heading font-black text-xl text-[#4A90D9] block">
              {profile.points}
            </span>
            <span className="text-[11px] font-bold text-gray-400">Points</span>
          </div>
        </div>
      </div>

      {/* Helper Connection Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#2C5F8A] flex items-center justify-center font-bold">
            <Heart className="w-6 h-6 fill-current text-rose-500" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
              Primary Helper
            </span>
            <h3 className="font-heading font-extrabold text-base text-gray-900 dark:text-white">
              {profile.caregiverName}
            </h3>
            <span className="text-xs text-gray-500">{profile.caregiverPhone}</span>
          </div>
        </div>

        <a
          href={`tel:${profile.caregiverPhone}`}
          className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#4CAF7D] hover:bg-emerald-100 transition active:scale-95"
          title="Call helper"
        >
          <Phone className="w-5 h-5 fill-current" />
        </a>
      </div>

      {/* Navigation Options */}
      <div className="space-y-2">
        <button
          onClick={() => setActiveView('rewards')}
          className="w-full p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 flex items-center justify-between font-bold text-sm text-gray-800 dark:text-gray-200 hover:border-[#4A90D9] transition"
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-[#F5A623]" />
            <span>My Rewards & Trophies</span>
          </div>
          <span className="text-xs text-gray-400">View</span>
        </button>

        <button
          onClick={() => setActiveView('settings')}
          className="w-full p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 flex items-center justify-between font-bold text-sm text-gray-800 dark:text-gray-200 hover:border-[#4A90D9] transition"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span>Settings & Comfort</span>
          </div>
          <span className="text-xs text-gray-400">Configure</span>
        </button>

        <button
          onClick={() => setActiveView('help')}
          className="w-full p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 flex items-center justify-between font-bold text-sm text-gray-800 dark:text-gray-200 hover:border-[#4A90D9] transition"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-[#4A90D9]" />
            <span>Help & FAQ</span>
          </div>
          <span className="text-xs text-gray-400">Open</span>
        </button>
      </div>
    </div>
  );
};
