import React, { useState } from 'react';
import {
  Smile,
  Meh,
  Frown,
  Mic,
  MicOff,
  Heart,
  Volume2,
  CheckCircle,
  Wind,
  Music,
  Footprints,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

export const MoodCheckInView: React.FC = () => {
  const { moodLogs, logMood, setShowCalmingModal, settings } = useApp();
  const { speak, startListening, stopListening, isListening } = useSpeech(settings.speechSpeed);

  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [noteInput, setNoteInput] = useState('');
  const [justLogged, setJustLogged] = useState(false);

  const moodChoices = [
    { level: 1 as const, emoji: '😄', label: 'Very Happy', color: 'hover:bg-emerald-50 text-emerald-600' },
    { level: 2 as const, emoji: '🙂', label: 'Happy', color: 'hover:bg-blue-50 text-blue-600' },
    { level: 3 as const, emoji: '😐', label: 'Okay', color: 'hover:bg-gray-50 text-gray-600' },
    { level: 4 as const, emoji: '🙁', label: 'Sad', color: 'hover:bg-orange-50 text-orange-600' },
    { level: 5 as const, emoji: '😰', label: 'Stressed', color: 'hover:bg-rose-50 text-rose-600' },
  ];

  const handleSelect = (level: 1 | 2 | 3 | 4 | 5, label: string) => {
    setSelectedLevel(level);
    setSelectedLabel(label);
    setJustLogged(false);
  };

  const handleVoiceNote = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        setNoteInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      });
    }
  };

  const handleSubmitMood = () => {
    if (!selectedLevel) return;
    logMood(selectedLevel, selectedLabel, noteInput.trim() || undefined);
    setJustLogged(true);
    speak(`Your mood of ${selectedLabel} has been saved.`);
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">
          Mood Check-In
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          How are you feeling today? All feelings are welcome here.
        </p>
      </div>

      {/* 5-Face Selection Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs">
        <h2 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white text-center mb-5">
          Tap the face that matches you:
        </h2>

        <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-6">
          {moodChoices.map((item) => (
            <button
              key={item.level}
              onClick={() => handleSelect(item.level, item.label)}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 transition active:scale-95 touch-target ${
                selectedLevel === item.level
                  ? 'border-[#4A90D9] bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-[#4A90D9]/30'
                  : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-4xl sm:text-5xl filter drop-shadow-xs mb-1.5">{item.emoji}</span>
              <span className="text-[11px] sm:text-xs font-black text-gray-700 dark:text-gray-300">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Optional Voice Note Input */}
        <div className="mb-5">
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400 block mb-1.5">
            Say or type a quick thought (Optional):
          </label>
          <div className="relative">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="e.g. Loved walking today, or feeling a bit rushed"
              className="w-full p-3 pr-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:border-[#4A90D9]"
            />
            <button
              type="button"
              onClick={handleVoiceNote}
              className={`absolute right-2 top-2 p-1.5 rounded-xl transition ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-gray-500 hover:text-[#4A90D9]'
              }`}
              title="Speak thought"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitMood}
          disabled={!selectedLevel}
          className="w-full min-h-[54px] rounded-2xl bg-[#4A90D9] hover:bg-[#2C5F8A] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow transition active:scale-98 disabled:opacity-40"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Save My Feeling</span>
        </button>

        {justLogged && (
          <p className="text-xs font-bold text-[#4CAF7D] text-center mt-3 animate-in fade-in">
            ✓ Your mood check-in has been logged and shared with your helper.
          </p>
        )}
      </div>

      {/* Calming Activity Suggestions Card (If sad or stressed selected) */}
      {(selectedLevel === 4 || selectedLevel === 5) && (
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/25 border-2 border-amber-300 dark:border-amber-900/50 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#F5A623] fill-current" />
            <h3 className="font-heading font-extrabold text-base text-amber-900 dark:text-amber-200">
              Would you like to try something calming?
            </h3>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            When you feel stressed or sad, taking a moment to breathe or listen to calm music can help your body relax.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setShowCalmingModal(true)}
              className="p-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-amber-200 dark:border-amber-800 text-xs font-extrabold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2 shadow-xs hover:border-[#4A90D9]"
            >
              <Wind className="w-4 h-4 text-[#68B28A]" />
              <span>Breathing Circle</span>
            </button>

            <button
              onClick={() => speak('Close your eyes for 30 seconds and listen to the peaceful birds singing outside.')}
              className="p-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-amber-200 dark:border-amber-800 text-xs font-extrabold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2 shadow-xs hover:border-[#4A90D9]"
            >
              <Music className="w-4 h-4 text-[#4A90D9]" />
              <span>Gentle Chime</span>
            </button>
          </div>
        </div>
      )}

      {/* Mood History Timeline */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs space-y-3">
        <h3 className="font-heading font-extrabold text-base text-gray-900 dark:text-white">
          Recent Mood Check-Ins
        </h3>

        <div className="space-y-2.5">
          {moodLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
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
                  <span className="font-extrabold text-sm text-gray-800 dark:text-gray-200 block">
                    {log.label}
                  </span>
                  {log.note && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 block line-clamp-1">
                      "{log.note}"
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-mono text-gray-400">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
