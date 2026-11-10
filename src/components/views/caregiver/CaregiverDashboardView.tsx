import React, { useState } from 'react';
import {
  Shield,
  CheckCircle,
  Bell,
  Heart,
  Clock,
  AlertTriangle,
  Plus,
  Send,
  Calendar,
  FileText,
  MapPin,
  TrendingUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

export const CaregiverDashboardView: React.FC = () => {
  const {
    profile,
    tasks,
    schedule,
    moodLogs,
    alerts,
    resolveAlert,
    sharedNotes,
    addSharedNote,
    setCaregiverView,
    settings,
  } = useApp();

  const { speak } = useSpeech(settings.speechSpeed);
  const [quickNote, setQuickNote] = useState('');

  // Stats
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const latestMood = moodLogs[0] || { label: 'Good', emoji: '🙂' };
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    addSharedNote(quickNote.trim());
    setQuickNote('');
    speak('Note posted to user dashboard.');
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Top Banner with Supported User Persona */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#2C5F8A] to-[#1E3A5F] text-white shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full rounded-xl object-cover"
            />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider block">
              Supporting Individual
            </span>
            <h1 className="font-heading font-black text-2xl truncate">
              {profile.name}
            </h1>
            <p className="text-xs text-blue-100">
              Active today · {profile.streakDays}-day routine streak · {profile.points} pts
            </p>
          </div>
        </div>

        <button
          onClick={() => setCaregiverView('notes')}
          className="px-3.5 py-2 rounded-xl bg-white text-[#2C5F8A] font-extrabold text-xs shrink-0 shadow-xs hover:bg-blue-50 transition"
        >
          Message Alex
        </button>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
            Tasks Completed
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-black text-2xl text-emerald-600">
              {completedTasksCount}
            </span>
            <span className="text-xs text-gray-400 font-semibold">/ {tasks.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
            Active Routine
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-black text-2xl text-[#4A90D9]">
              {schedule.length}
            </span>
            <span className="text-xs text-gray-400 font-semibold">events</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
            Latest Mood
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-black text-xl text-gray-900 dark:text-white">
              {latestMood.label}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
            Active Alerts
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-heading font-black text-2xl ${
                unresolvedAlerts.length > 0 ? 'text-[#E8695A]' : 'text-emerald-600'
              }`}
            >
              {unresolvedAlerts.length}
            </span>
            <span className="text-xs text-gray-400 font-semibold">items</span>
          </div>
        </div>
      </div>

      {/* Critical Alert Feed (Missed reminders, I'm Lost events, struggle alerts) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#E8695A]" />
            <h2 className="font-heading font-black text-lg text-gray-900 dark:text-white">
              Safety & Escalation Feed
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-400">
            {alerts.length} events logged
          </span>
        </div>

        <div className="space-y-2.5">
          {alerts.slice(0, 4).map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                alert.resolved
                  ? 'bg-gray-50/70 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 opacity-75'
                  : 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`font-extrabold text-sm ${
                      alert.resolved
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {alert.title}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{alert.timestamp}</span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-1.5">
                  {alert.description}
                </p>

                {alert.location && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-gray-900 text-[11px] font-semibold text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>Location: {alert.location.address}</span>
                  </div>
                )}
              </div>

              {!alert.resolved ? (
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-xs"
                >
                  Resolve
                </button>
              ) : (
                <span className="text-xs font-bold text-[#4CAF7D] shrink-0">Resolved</span>
              )}
            </div>
          ))}

          {alerts.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">
              All quiet. No safety alerts or missed reminders.
            </p>
          )}
        </div>
      </div>

      {/* Quick Action Hub for Helper */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setCaregiverView('tasks')}
          className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 text-left hover:border-[#2C5F8A] transition group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-[#2C5F8A] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <CheckCircle className="w-5 h-5" />
          </div>
          <span className="font-heading font-extrabold text-sm text-gray-900 dark:text-white block">
            Add/Edit Tasks
          </span>
          <span className="text-xs text-gray-500">Decompose with AI</span>
        </button>

        <button
          onClick={() => setCaregiverView('schedule')}
          className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 text-left hover:border-[#2C5F8A] transition group"
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#68B28A] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="font-heading font-extrabold text-sm text-gray-900 dark:text-white block">
            Manage Routine
          </span>
          <span className="text-xs text-gray-500">Schedule timeline</span>
        </button>

        <button
          onClick={() => setCaregiverView('progress')}
          className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 text-left hover:border-[#2C5F8A] transition group col-span-2 sm:col-span-1"
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="font-heading font-extrabold text-sm text-gray-900 dark:text-white block">
            Adherence Reports
          </span>
          <span className="text-xs text-gray-500">Weekly completion</span>
        </button>
      </div>

      {/* Shared Note Quick Box */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
        <h3 className="font-heading font-extrabold text-base text-gray-900 dark:text-white mb-2">
          Post an Encouraging Note to Alex's Dashboard
        </h3>
        <form onSubmit={handleSendNote} className="flex gap-2">
          <input
            type="text"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="e.g. Great job on your morning routine! See you at 2 PM."
            className="flex-1 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:border-[#2C5F8A]"
          />
          <button
            type="submit"
            className="px-4 py-3 rounded-2xl bg-[#2C5F8A] hover:bg-blue-900 text-white font-extrabold text-xs flex items-center gap-1.5 shadow"
          >
            <Send className="w-4 h-4" />
            <span>Post Note</span>
          </button>
        </form>
      </div>
    </div>
  );
};
