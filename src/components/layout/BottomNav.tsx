import React from 'react';
import {
  Home,
  Calendar,
  CheckCircle,
  Camera,
  FileText,
  User,
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  Clock,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { role, activeView, setActiveView, caregiverView, setCaregiverView } = useApp();

  if (activeView === 'task_runner') {
    // Hide bottom nav while actively executing micro-steps to keep focus 100% on current task
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-[#E8E5DF] dark:border-gray-800 pb-safe shadow-lg">
      <div className="max-w-md mx-auto relative px-2">
        {/* Floating Amber Camera Button ("Explain This") - Visible in User Mode */}
        {role === 'user' && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-50">
            <button
              onClick={() => setActiveView('camera_helper')}
              className={`flex flex-col items-center justify-center w-15 h-15 rounded-full shadow-lg border-3 border-white dark:border-[#121212] transition-all transform active:scale-95 ${
                activeView === 'camera_helper'
                  ? 'bg-[#2C5F8A] text-white ring-4 ring-[#F5A623]/40'
                  : 'bg-gradient-to-tr from-[#F5A623] to-[#FFC043] text-gray-900 hover:brightness-105'
              }`}
              aria-label="Explain This - Camera Helper"
            >
              <Camera className="w-6 h-6 stroke-[2.2]" />
              <span className="text-[9px] font-extrabold tracking-tight mt-0.5 leading-none">
                Explain
              </span>
            </button>
          </div>
        )}

        {/* User Mode Tabs */}
        {role === 'user' ? (
          <div className="grid grid-cols-5 items-center h-16">
            {/* 1. Home */}
            <button
              onClick={() => setActiveView('home')}
              className={`flex flex-col items-center justify-center h-full touch-target transition ${
                activeView === 'home'
                  ? 'text-[#2C5F8A] dark:text-[#4A90D9] font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              <Home className={`w-5 h-5 ${activeView === 'home' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[11px] font-medium tracking-tight mt-1">Home</span>
            </button>

            {/* 2. Schedule */}
            <button
              onClick={() => setActiveView('schedule')}
              className={`flex flex-col items-center justify-center h-full touch-target transition ${
                activeView === 'schedule'
                  ? 'text-[#2C5F8A] dark:text-[#4A90D9] font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              <Calendar className={`w-5 h-5 ${activeView === 'schedule' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[11px] font-medium tracking-tight mt-1">Schedule</span>
            </button>

            {/* 3. Center Space for Floating Camera */}
            <div className="flex flex-col items-center justify-end h-full pb-1 pointer-events-none">
              <span className="text-[9px] text-gray-400 font-semibold opacity-0">Camera</span>
            </div>

            {/* 4. Tasks */}
            <button
              onClick={() => setActiveView('tasks')}
              className={`flex flex-col items-center justify-center h-full touch-target transition ${
                activeView === 'tasks'
                  ? 'text-[#2C5F8A] dark:text-[#4A90D9] font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              <CheckCircle className={`w-5 h-5 ${activeView === 'tasks' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[11px] font-medium tracking-tight mt-1">Tasks</span>
            </button>

            {/* 5. Simplify */}
            <button
              onClick={() => setActiveView('simplify')}
              className={`flex flex-col items-center justify-center h-full touch-target transition ${
                activeView === 'simplify'
                  ? 'text-[#2C5F8A] dark:text-[#4A90D9] font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              <FileText className={`w-5 h-5 ${activeView === 'simplify' ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[11px] font-medium tracking-tight mt-1">Simplify</span>
            </button>
          </div>
        ) : (
          /* Caregiver Mode Tabs */
          <div className="grid grid-cols-5 items-center h-16">
            <button
              onClick={() => setCaregiverView('dashboard')}
              className={`flex flex-col items-center justify-center h-full touch-target transition ${
                caregiverView === 'dashboard'
                  ? 'text-[#2C5F8A] dark:text-teal-400 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight mt-1">Hub</span>
            </button>

            <button
              onClick={() => setCaregiverView('schedule')}
              className={`flex flex-col items-center justify-center h-full touch-target transition ${
                caregiverView === 'schedule'
                  ? 'text-[#2C5F8A] dark:text-teal-400 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight mt-1">Routine</span>
            </button>

            <button
              onClick={() => setCaregiverView('tasks')}
              className={`flex flex-col items-center justify-center h-full touch-target transition ${
                caregiverView === 'tasks'
                  ? 'text-[#2C5F8A] dark:text-teal-400 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight mt-1">Tasks</span>
            </button>

            <button
              onClick={() => setCaregiverView('progress')}
              className={`flex flex-col items-center justify-center h-full touch-target transition ${
                caregiverView === 'progress'
                  ? 'text-[#2C5F8A] dark:text-teal-400 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight mt-1">Reports</span>
            </button>

            <button
              onClick={() => setCaregiverView('notes')}
              className={`flex flex-col items-center justify-center h-full touch-target transition ${
                caregiverView === 'notes'
                  ? 'text-[#2C5F8A] dark:text-teal-400 font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[11px] font-medium tracking-tight mt-1">Notes</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
