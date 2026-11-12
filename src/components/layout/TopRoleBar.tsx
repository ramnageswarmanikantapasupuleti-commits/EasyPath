import React from 'react';
import { Volume2, VolumeX, Shield, User, Heart, Sparkles, AlertTriangle, LogIn, Database, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { useSpeech } from '../../hooks/useSpeech';

export const TopRoleBar: React.FC = () => {
  const {
    role,
    setRole,
    settings,
    updateSettings,
    isLostActive,
    cancelImLost,
    setActiveView,
    setIsAuthModalOpen,
    replayIntroAnimation,
  } = useApp();
  const { currentUser, userProfile, updateRole } = useAuth();
  const { isSpeaking, stopSpeaking, speak } = useSpeech(settings.speechSpeed);

  const toggleSound = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak('Audio guidance is active. Tap any speaker button to read text aloud.');
    }
    updateSettings({ soundFeedback: !settings.soundFeedback });
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-b border-[#E8E5DF] dark:border-gray-800 transition-colors shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand & Active Mode Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => {
              if (role === 'user') setActiveView('home');
            }}
            className="flex items-center gap-2 group text-left"
            aria-label="EasyPath Home"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-[#0f766e] shadow-xs group-hover:scale-105 transition-transform shrink-0 border border-teal-800/20">
              <img
                src="/app-icon.png"
                alt="EasyPath Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="truncate">
              <span className="font-heading font-extrabold text-lg text-gray-900 dark:text-white tracking-tight leading-none block">
                EasyPath
              </span>
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block leading-tight">
                {role === 'user' ? 'Daily Guide' : 'Caregiver Hub'}
              </span>
            </div>
          </button>

          {/* Quick Intro Animation Replay Button */}
          <button
            onClick={() => replayIntroAnimation()}
            className="p-1 rounded-lg text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition text-xs"
            title="Replay calming welcome animation"
            aria-label="Replay intro animation"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center / Right Actions: Emergency Tag (if lost), Audio Toggle, PWA Install, Role Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {isLostActive && (
            <button
              onClick={cancelImLost}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8695A] text-white text-xs font-bold animate-pulse shadow"
              title="I'm Lost mode is active. Tap when safe."
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Helper Alerted</span>
              <span>Safe Now</span>
            </button>
          )}

          {/* Quick Audio Readout / TTS Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition active:scale-95 touch-target flex items-center justify-center ${
              isSpeaking
                ? 'bg-[#4A90D9] text-white border-[#4A90D9] animate-pulse'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label={isSpeaking ? 'Stop speaking' : 'Speech guidance active'}
            title="Read out screen / Voice assistant"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* Dual Role Switcher Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setRole('user');
                if (currentUser) updateRole('user');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                role === 'user'
                  ? 'bg-white dark:bg-gray-700 text-[#2C5F8A] dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
              aria-label="Switch to User Mode"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Alex (User)</span>
              <span className="sm:hidden">User</span>
            </button>

            <button
              onClick={() => {
                setRole('caregiver');
                if (currentUser) updateRole('caregiver');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                role === 'caregiver'
                  ? 'bg-[#2C5F8A] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
              aria-label="Switch to Caregiver Mode"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sarah (Helper)</span>
              <span className="sm:hidden">Helper</span>
            </button>
          </div>

          {/* Cloud SQL Account & Data Isolation Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition text-xs font-bold"
            title="Cloud SQL PostgreSQL Database & Account Sessions"
            aria-label="Open Account & Cloud Database Sessions"
          >
            {currentUser ? (
              <>
                <div className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline font-medium text-[11px] truncate max-w-[80px]">
                  {currentUser.displayName?.split(' ')[0] || 'User'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Cloud DB Synced" />
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span className="hidden sm:inline">Cloud Sync</span>
                <span className="sm:hidden">Sync</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
