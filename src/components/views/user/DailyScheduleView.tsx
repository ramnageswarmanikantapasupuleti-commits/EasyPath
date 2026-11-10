import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Circle,
  Play,
  Plus,
  Volume2,
  X,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

export const DailyScheduleView: React.FC = () => {
  const { schedule, toggleScheduleEvent, addScheduleEvent, startTask, settings } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  const [currentDayOffset, setCurrentDayOffset] = useState<number>(0);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [newCategory, setNewCategory] = useState<'routine' | 'medicine' | 'meal' | 'appointment' | 'leisure'>('routine');

  const getDateLabel = () => {
    const d = new Date();
    d.setDate(d.getDate() + currentDayOffset);
    if (currentDayOffset === 0) return 'Today, ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (currentDayOffset === 1) return 'Tomorrow, ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (currentDayOffset === -1) return 'Yesterday, ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'medicine':
        return 'border-l-teal-500 text-teal-700 bg-teal-50 dark:bg-teal-950/30';
      case 'meal':
        return 'border-l-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30';
      case 'appointment':
        return 'border-l-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/30';
      case 'leisure':
        return 'border-l-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30';
      default:
        return 'border-l-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950/30';
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addScheduleEvent({
      id: `sch-${Date.now()}`,
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
      completed: false,
    });

    setNewTitle('');
    setShowAddEventModal(false);
    speak(`Added ${newTitle} to your schedule.`);
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Date Navigation Strip */}
      <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
        <button
          onClick={() => setCurrentDayOffset((prev) => prev - 1)}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 touch-target"
          aria-label="Previous day"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="font-heading font-black text-lg sm:text-xl text-gray-900 dark:text-white block">
            {getDateLabel()}
          </span>
          {currentDayOffset !== 0 && (
            <button
              onClick={() => setCurrentDayOffset(0)}
              className="text-xs font-bold text-[#4A90D9] hover:underline"
            >
              Back to Today
            </button>
          )}
        </div>

        <button
          onClick={() => setCurrentDayOffset((prev) => prev + 1)}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 touch-target"
          aria-label="Next day"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Header with Quick Add */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Timeline Events
        </span>

        <button
          onClick={() => setShowAddEventModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#4A90D9] font-bold text-xs hover:bg-blue-100"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Timeline List */}
      <div className="space-y-3">
        {schedule.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs flex items-center justify-between gap-3 transition ${
              item.completed ? 'opacity-65' : ''
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => toggleScheduleEvent(item.id)}
                className="shrink-0 p-1 touch-target text-gray-400 hover:text-[#4CAF7D]"
                aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {item.completed ? (
                  <CheckCircle className="w-7 h-7 text-[#4CAF7D] fill-emerald-100 dark:fill-emerald-950" />
                ) : (
                  <Circle className="w-7 h-7 stroke-[2]" />
                )}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.time}
                  </span>
                  {item.isCaregiverAdded && (
                    <span className="text-[10px] font-bold text-[#2C5F8A] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                      Helper added
                    </span>
                  )}
                </div>

                <h4
                  className={`font-heading font-extrabold text-base sm:text-lg text-gray-900 dark:text-white truncate ${
                    item.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                  }`}
                >
                  {item.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => speak(`${item.time}: ${item.title}`)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Read event aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {item.taskId && !item.completed && (
                <button
                  onClick={() => startTask(item.taskId!)}
                  className="px-3 py-1.5 rounded-xl bg-[#4A90D9] text-white text-xs font-extrabold flex items-center gap-1 shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                Add an Event
              </h3>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Afternoon Walk"
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:border-[#4A90D9]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Time
                </label>
                <input
                  type="text"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 11:30 AM"
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:border-[#4A90D9]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none"
                >
                  <option value="routine">Routine</option>
                  <option value="medicine">Medicine</option>
                  <option value="meal">Meal</option>
                  <option value="appointment">Appointment</option>
                  <option value="leisure">Leisure / Exercise</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#4A90D9] text-white font-extrabold text-sm shadow hover:bg-[#2C5F8A]"
                >
                  Save to Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="w-full py-2 text-xs text-gray-500 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
