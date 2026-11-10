import React, { useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  Camera,
  Bell,
  Heart,
  Users,
  Compass,
  FileText,
  Volume2,
  Award,
  ArrowRight,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Mic,
  Film,
  MessageSquare,
  Radio,
  Bot,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

export const HomeDashboard: React.FC = () => {
  const {
    profile,
    tasks,
    schedule,
    setActiveView,
    startTask,
    logMood,
    sharedNotes,
    settings,
    moodLogs,
    setIsSanctuaryOpen,
    openTranscriber,
    openVideoGuide,
  } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  // Determine time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Find the next incomplete task
  const nextTask = tasks.find((t) => t.status !== 'completed') || tasks[0];

  // Most recent shared note
  const latestNote = sharedNotes[0];

  // Read aloud page on click
  const readPage = () => {
    const greeting = `${getGreeting()}, ${profile.preferredName || profile.name}. Next up today: ${
      nextTask ? nextTask.title : 'All tasks completed for today'
    }. How are you feeling right now?`;
    speak(greeting);
  };

  const handleMoodTap = (level: 1 | 2 | 3 | 4 | 5, label: string) => {
    logMood(level, label);
    speak(`You logged feeling ${label}. Thank you for checking in.`);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Friendly Top Welcome Banner */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-4 sm:p-5 rounded-3xl border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#4A90D9]/30 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="font-heading font-black text-2xl text-gray-900 dark:text-white truncate">
              {getGreeting()}, {profile.preferredName || profile.name}!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              You have {tasks.filter((t) => t.status !== 'completed').length} things to do today
            </p>
          </div>
        </div>

        <button
          onClick={readPage}
          className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#4A90D9] hover:bg-blue-100 transition active:scale-95 shrink-0 touch-target"
          aria-label="Read home screen aloud"
          title="Read screen aloud"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      </div>

      {/* "What's Next" Focal Card */}
      {nextTask && (
        <div className="bg-gradient-to-br from-[#4A90D9] to-[#2C5F8A] text-white p-5 sm:p-6 rounded-3xl shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-100">
                ⭐ What's Next For You
              </span>
              <span className="text-xs bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-bold">
                ~{nextTask.estimatedMinutes} mins
              </span>
            </div>

            <h2 className="font-heading font-black text-2xl mb-1 text-white">
              {nextTask.title}
            </h2>
            <p className="text-sm text-blue-100 mb-5">
              {nextTask.steps.length} easy visual micro-steps. We will guide you one step at a time.
            </p>

            <button
              onClick={() => startTask(nextTask.id, 0)}
              className="w-full min-h-[54px] rounded-2xl bg-white text-[#2C5F8A] hover:bg-blue-50 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
            >
              <span>Start Now</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Mood Check-In Row (1-Tap Emoji Faces) */}
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-3xl border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="font-heading font-bold text-base text-gray-800 dark:text-gray-200">
            How are you feeling right now?
          </span>
          <button
            onClick={() => setActiveView('mood')}
            className="text-xs font-semibold text-[#4A90D9] hover:underline"
          >
            History
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[
            { level: 1 as const, emoji: '😄', label: 'Very Happy', color: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30' },
            { level: 2 as const, emoji: '🙂', label: 'Happy', color: 'hover:bg-blue-50 dark:hover:bg-blue-950/30' },
            { level: 3 as const, emoji: '😐', label: 'Okay', color: 'hover:bg-gray-50 dark:hover:bg-gray-800' },
            { level: 4 as const, emoji: '🙁', label: 'Sad', color: 'hover:bg-orange-50 dark:hover:bg-orange-950/30' },
            { level: 5 as const, emoji: '😰', label: 'Stressed', color: 'hover:bg-rose-50 dark:hover:bg-rose-950/30' },
          ].map((item) => (
            <button
              key={item.level}
              onClick={() => handleMoodTap(item.level, item.label)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border border-transparent transition active:scale-95 touch-target ${item.color}`}
              aria-label={`Log mood: ${item.label}`}
            >
              <span className="text-3xl sm:text-4xl filter drop-shadow-xs">{item.emoji}</span>
              <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 mt-1">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2x3 Large Shortcut Navigation Grid */}
      <div>
        <h3 className="font-heading font-extrabold text-lg text-gray-800 dark:text-gray-200 mb-3 px-1">
          Quick Shortcuts
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* 1. Schedule */}
          <button
            onClick={() => setActiveView('schedule')}
            className="flex flex-col items-start p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs hover:border-[#4A90D9] transition text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-[#4A90D9] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="font-heading font-bold text-base text-gray-900 dark:text-white">
              My Schedule
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {schedule.length} events planned
            </span>
          </button>

          {/* 2. Tasks */}
          <button
            onClick={() => setActiveView('tasks')}
            className="flex flex-col items-start p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs hover:border-[#4A90D9] transition text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-[#4CAF7D] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="font-heading font-bold text-base text-gray-900 dark:text-white">
              My Tasks
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Step-by-step guides
            </span>
          </button>

          {/* 3. Camera Helper */}
          <button
            onClick={() => setActiveView('camera_helper')}
            className="flex flex-col items-start p-4 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-xs hover:border-[#F5A623] transition text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F5A623] text-white flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="font-heading font-bold text-base text-gray-900 dark:text-white">
              Camera Helper
            </span>
            <span className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              Explain letters & items
            </span>
          </button>

          {/* 4. Safe Navigation */}
          <button
            onClick={() => setActiveView('navigation')}
            className="flex flex-col items-start p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs hover:border-[#4A90D9] transition text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <span className="font-heading font-bold text-base text-gray-900 dark:text-white">
              Safe Walk
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Landmark directions
            </span>
          </button>

          {/* 5. Memory Aid */}
          <button
            onClick={() => setActiveView('memory_aid')}
            className="flex flex-col items-start p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs hover:border-[#4A90D9] transition text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/40 text-purple-500 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-heading font-bold text-base text-gray-900 dark:text-white">
              Memory Aid
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              People & belongings
            </span>
          </button>

          {/* 6. Life Skills */}
          <button
            onClick={() => setActiveView('life_skills')}
            className="flex flex-col items-start p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs hover:border-[#4A90D9] transition text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-[#68B28A] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <span className="font-heading font-bold text-base text-gray-900 dark:text-white">
              Life Skills
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Practice shopping & calls
            </span>
          </button>
        </div>
      </div>

      {/* AI Accessibility & Sensory Innovations */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-heading font-extrabold text-sm sm:text-base text-gray-800 dark:text-gray-200">
              Sensory &amp; Visual Guides
            </h3>
          </div>
          <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider bg-teal-100/60 dark:bg-teal-900/40 px-2 py-0.5 rounded-full">
            Accessible Tools
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. 3D Calming Sanctuary */}
          <button
            onClick={() => setIsSanctuaryOpen(true)}
            className="flex items-center space-x-3 p-3.5 rounded-2xl bg-teal-600 text-white shadow-sm hover:bg-teal-500 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm block leading-tight">3D Sanctuary</span>
              <span className="text-[11px] text-teal-100">Peaceful 3D garden &amp; water</span>
            </div>
          </button>

          {/* 2. Audio Dictation (Gemini 3.5 Transcribe) */}
          <button
            onClick={() => openTranscriber()}
            className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-teal-500 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm text-slate-900 dark:text-white block leading-tight">Voice Dictate</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Gemini 3.5 Transcribe</span>
            </div>
          </button>

          {/* 3. Video Step Guides (Gemini Omni Flash) */}
          <button
            onClick={() => openVideoGuide()}
            className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-indigo-500 transition text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm text-slate-900 dark:text-white block leading-tight">Video Guide</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Omni Flash Visual</span>
            </div>
          </button>
        </div>
      </div>

      {/* Note from Helper Card */}
      {latestNote && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#F5A623] text-white flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs uppercase tracking-wide text-amber-900 dark:text-amber-200">
                Message from {latestNote.author}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {latestNote.timestamp}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
              "{latestNote.text}"
            </p>
          </div>
          <button
            onClick={() => speak(`Message from ${latestNote.author}: ${latestNote.text}`)}
            className="p-2 rounded-xl text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 shrink-0"
            aria-label="Read note aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
