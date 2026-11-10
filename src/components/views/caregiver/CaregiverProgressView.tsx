import React from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle,
  Heart,
  Clock,
  Sparkles,
  Smile,
  Shield,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const CaregiverProgressView: React.FC = () => {
  const { profile, tasks, moodLogs, lifeSkills, alerts } = useApp();

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 100;
  const completedSkills = lifeSkills.filter((s) => s.completed);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      <div>
        <h1 className="font-heading font-black text-2xl text-gray-900 dark:text-white">
          Progress & Independence Reports
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Weekly analytics, mood trend logs, and life skills practice
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Task Adherence
          </span>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-heading font-black text-3xl text-emerald-600">
              {completionPercentage}%
            </span>
            <span className="text-xs text-gray-400">completion</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Active Streak
          </span>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-heading font-black text-3xl text-[#F5A623]">
              {profile.streakDays}
            </span>
            <span className="text-xs text-gray-400">consecutive days</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Routines maintained consistently this week.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Life Skills Practiced
          </span>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-heading font-black text-3xl text-[#4A90D9]">
              {completedSkills.length} / {lifeSkills.length}
            </span>
            <span className="text-xs text-gray-400">modules</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Shopping and phone appointment modules mastered.
          </p>
        </div>
      </div>

      {/* Mood History Log for Caregiver */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
            <h2 className="font-heading font-black text-lg text-gray-900 dark:text-white">
              Mood Check-In Log
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-400">
            {moodLogs.length} entries recorded
          </span>
        </div>

        <div className="space-y-2.5">
          {moodLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {log.level === 1
                    ? '😄'
                    : log.level === 2
                    ? '🙂'
                    : log.level === 3
                    ? '😐'
                    : log.level === 4
                    ? '🙁'
                    : '😰'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                      {log.label}
                    </span>
                    {log.level >= 4 && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        Stress Alert
                      </span>
                    )}
                  </div>
                  {log.note && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                      "{log.note}"
                    </p>
                  )}
                </div>
              </div>

              <span className="text-[11px] font-mono text-gray-400">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Life Skills Competencies Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs space-y-3">
        <h2 className="font-heading font-black text-lg text-gray-900 dark:text-white mb-2">
          Life-Skills Competencies
        </h2>

        <div className="space-y-2">
          {lifeSkills.map((sk) => (
            <div
              key={sk.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800"
            >
              <div>
                <span className="font-bold text-sm text-gray-900 dark:text-white block">
                  {sk.title}
                </span>
                <span className="text-xs text-gray-400">
                  {sk.steps.length} interactive simulation steps
                </span>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  sk.completed
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {sk.completed ? 'Mastered ✓' : 'In Practice'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
