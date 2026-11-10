import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  X,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

export const CaregiverScheduleManager: React.FC = () => {
  const { schedule, addScheduleEvent, toggleScheduleEvent, settings } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('02:00 PM');
  const [category, setCategory] = useState<'routine' | 'medicine' | 'meal' | 'appointment' | 'leisure'>('routine');
  const [showAdd, setShowAdd] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addScheduleEvent({
      id: `sch-${Date.now()}`,
      title: title.trim(),
      time,
      category,
      completed: false,
      isCaregiverAdded: true,
    });

    setTitle('');
    setShowAdd(false);
    speak(`Added ${title} to schedule.`);
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl text-gray-900 dark:text-white">
            Schedule & Routine Manager
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Configure Alex's daily routine checkpoints and timing
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2C5F8A] text-white font-bold text-xs shadow hover:bg-blue-900"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Routine Event</span>
        </button>
      </div>

      {/* Routine Event Cards */}
      <div className="space-y-3">
        {schedule.map((ev) => (
          <div
            key={ev.id}
            className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-[#2C5F8A] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg">
                {ev.time}
              </span>

              <div>
                <h3 className="font-heading font-extrabold text-base text-gray-900 dark:text-white">
                  {ev.title}
                </h3>
                <span className="text-xs text-gray-400 font-medium capitalize">
                  {ev.category} {ev.isCaregiverAdded ? '· Added by Helper' : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleScheduleEvent(ev.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  ev.completed
                    ? 'bg-emerald-50 text-[#4CAF7D] border border-emerald-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {ev.completed ? 'Completed' : 'Pending'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                Add Routine Item
              </h3>
              <button onClick={() => setShowAdd(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Speech Therapy Session"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Time
                </label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 02:00 PM"
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                >
                  <option value="routine">Routine</option>
                  <option value="medicine">Medicine</option>
                  <option value="meal">Meal</option>
                  <option value="appointment">Appointment</option>
                  <option value="leisure">Leisure</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#2C5F8A] text-white font-bold text-sm shadow"
                >
                  Save Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="w-full py-2 text-xs font-bold text-gray-500"
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
