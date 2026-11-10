import React, { useState } from 'react';
import {
  Settings,
  Type,
  Palette,
  Volume2,
  Lock,
  Trash2,
  Check,
  Shield,
  RotateCcw,
  Sparkles,
  Heart,
  Sliders,
  Mic,
  Activity,
  Command,
  Plus,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech, playGentleChime } from '../../../hooks/useSpeech';
import { ColorTheme, FontSizeScale, VoiceTargetView } from '../../../types';
import { VOICE_COMMANDS } from '../../../services/voiceCommandService';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    profile,
    updateProfile,
    resetAllData,
    customVoiceShortcuts,
    addCustomVoiceShortcut,
    deleteCustomVoiceShortcut,
    setActiveView,
    setIsSanctuaryOpen,
    setShowCalmingModal,
  } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  const [enteredPin, setEnteredPin] = useState('');
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  // New Voice Shortcut state
  const [isAddingShortcut, setIsAddingShortcut] = useState(false);
  const [newShortcutPhrase, setNewShortcutPhrase] = useState('');
  const [newShortcutTarget, setNewShortcutTarget] = useState<VoiceTargetView>('schedule');
  const [newShortcutLabel, setNewShortcutLabel] = useState('My Schedule');

  const testVoice = (speed: number) => {
    speak(`This is how I read aloud at this speed.`);
  };

  const handlePinUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === profile.caregiverPin || enteredPin === '1234') {
      setIsPinUnlocked(true);
      setPinError(false);
      playGentleChime('success');
    } else {
      setPinError(true);
      playGentleChime('alert');
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">
          Settings & Comfort
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Make EasyPath feel just right for your eyes, ears, and comfort
        </p>
      </div>

      {/* 1. Visual Appearance */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-[#4A90D9]" />
          <h2 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
            Color Themes
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'default' as ColorTheme, name: 'Default', desc: 'Soft Sky & Cream', bg: 'bg-[#FAF8F5]', border: 'border-[#4A90D9]' },
            { id: 'high-contrast' as ColorTheme, name: 'High Contrast', desc: 'Bold Black & White', bg: 'bg-black text-white', border: 'border-yellow-400' },
            { id: 'warm' as ColorTheme, name: 'Soft Warm', desc: 'Sage & Earth', bg: 'bg-[#FBF6EE]', border: 'border-[#68B28A]' },
          ].map((th) => (
            <button
              key={th.id}
              onClick={() => {
                updateSettings({ theme: th.id });
                playGentleChime('chime');
              }}
              className={`p-3 rounded-2xl border-2 text-left transition active:scale-95 touch-target ${
                settings.theme === th.id
                  ? `${th.border} ring-2 ring-[#4A90D9]/30`
                  : 'border-gray-200 dark:border-gray-700'
              } ${th.bg}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading font-extrabold text-xs sm:text-sm block">
                  {th.name}
                </span>
                {settings.theme === th.id && <Check className="w-4 h-4 text-[#4A90D9]" />}
              </div>
              <span className="text-[10px] opacity-70 block">{th.desc}</span>
            </button>
          ))}
        </div>

        {/* Font Size Selector */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5 mb-3">
            <Type className="w-5 h-5 text-[#4A90D9]" />
            <h3 className="font-heading font-extrabold text-base text-gray-900 dark:text-white">
              Text Size
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'normal' as FontSizeScale, label: 'A', title: 'Normal (18px)' },
              { id: 'large' as FontSizeScale, label: 'A+', title: 'Large (22px)' },
              { id: 'xlarge' as FontSizeScale, label: 'A++', title: 'Extra Large (26px)' },
            ].map((sz) => (
              <button
                key={sz.id}
                onClick={() => {
                  updateSettings({ fontSize: sz.id });
                  playGentleChime('chime');
                }}
                className={`py-3 px-2 rounded-2xl border-2 text-center transition active:scale-95 touch-target ${
                  settings.fontSize === sz.id
                    ? 'border-[#4A90D9] bg-blue-50/60 dark:bg-blue-950/40 text-[#4A90D9] font-black ring-2 ring-[#4A90D9]/20'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="font-heading font-black text-xl block mb-0.5">{sz.label}</span>
                <span className="text-[11px] font-bold block">{sz.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Voice & Audio Settings */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Volume2 className="w-5 h-5 text-[#4A90D9]" />
          <h2 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
            Speech & Audio Guidance
          </h2>
        </div>

        {/* Speech Rate */}
        <div>
          <label className="text-xs font-bold text-gray-600 dark:text-gray-400 block mb-2">
            Speech Speed: {settings.speechSpeed}x
          </label>
          <div className="flex items-center gap-2">
            {[
              { speed: 0.8, label: 'Slow (0.8x)' },
              { speed: 1.0, label: 'Normal (1.0x)' },
              { speed: 1.2, label: 'Faster (1.2x)' },
            ].map((spd) => (
              <button
                key={spd.speed}
                onClick={() => {
                  updateSettings({ speechSpeed: spd.speed });
                  testVoice(spd.speed);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                  settings.speechSpeed === spd.speed
                    ? 'border-[#4A90D9] bg-blue-50 dark:bg-blue-950/40 text-[#4A90D9]'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-read Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="font-heading font-extrabold text-sm text-gray-900 dark:text-white block">
              Auto-read Steps Aloud
            </span>
            <span className="text-xs text-gray-500">
              Speaks instructions automatically when each step loads
            </span>
          </div>

          <button
            onClick={() => updateSettings({ autoRead: !settings.autoRead })}
            className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
              settings.autoRead ? 'bg-[#4A90D9]' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.autoRead ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2.5 Voice Recognition & Hands-Free Navigation */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mic className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
              Voice Recognition &amp; Commands
            </h2>
          </div>

          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-0.5 rounded-full">
            Active
          </span>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Control the entire app hands-free using spoken commands. The floating microphone button in the top right listens in real time.
        </p>

        {/* Feature summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
              1. Real-Time Speech Nav
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Web Speech API parses commands locally with instant word streaming.
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
              2. Gemini 3.5 Transcribe
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Cloud AI dictation for longer sentences, letters, and memories.
            </span>
          </div>
        </div>

        {/* Custom Voice Shortcuts Section */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Custom Voice Shortcuts ({customVoiceShortcuts.length})
            </span>
            {!isAddingShortcut && (
              <button
                type="button"
                onClick={() => setIsAddingShortcut(true)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Shortcut</span>
              </button>
            )}
          </div>

          {/* Inline Add Shortcut Form */}
          {isAddingShortcut && (
            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-teal-800 dark:text-teal-300">
                  New Custom Voice Shortcut
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingShortcut(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Spoken Trigger Phrase
                </label>
                <input
                  type="text"
                  value={newShortcutPhrase}
                  onChange={(e) => setNewShortcutPhrase(e.target.value)}
                  placeholder="e.g. My Schedule, Mood check, Where am I"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  App Destination View
                </label>
                <select
                  value={newShortcutTarget}
                  onChange={(e) => {
                    const val = e.target.value as VoiceTargetView;
                    setNewShortcutTarget(val);
                    if (val === 'schedule') setNewShortcutLabel('My Schedule');
                    else if (val === 'mood') setNewShortcutLabel('Mood Check');
                    else if (val === 'tasks') setNewShortcutLabel('My Tasks');
                    else if (val === 'camera_helper') setNewShortcutLabel('Camera Helper');
                    else if (val === 'sanctuary') setNewShortcutLabel('3D Sanctuary');
                    else if (val === 'navigation') setNewShortcutLabel('Safe Walk');
                    else if (val === 'simplify') setNewShortcutLabel('Text Simplifier');
                    else if (val === 'breathe') setNewShortcutLabel('Calm Breathing');
                    else if (val === 'memory_aid') setNewShortcutLabel('Memory Aid');
                    else if (val === 'call_helper') setNewShortcutLabel('Call Helper');
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
                >
                  <option value="schedule">📅 My Schedule</option>
                  <option value="mood">😊 Mood Check</option>
                  <option value="tasks">✅ My Tasks</option>
                  <option value="camera_helper">📷 Camera Helper</option>
                  <option value="sanctuary">🌸 3D Calming Sanctuary</option>
                  <option value="navigation">🚶 Safe Walk Navigation</option>
                  <option value="simplify">📝 Text Simplifier</option>
                  <option value="breathe">🫁 Calm Breathing</option>
                  <option value="memory_aid">👥 Memory Aid</option>
                  <option value="call_helper">📞 Call Helper</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingShortcut(false)}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-xs font-medium text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newShortcutPhrase.trim()}
                  onClick={() => {
                    if (!newShortcutPhrase.trim()) return;
                    addCustomVoiceShortcut({
                      phrase: newShortcutPhrase.trim(),
                      targetView: newShortcutTarget,
                      label: newShortcutLabel,
                      responseMessage: `Opening ${newShortcutLabel}.`,
                    });
                    setIsAddingShortcut(false);
                    setNewShortcutPhrase('');
                  }}
                  className="px-3.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs"
                >
                  Save Shortcut
                </button>
              </div>
            </div>
          )}

          {/* List of shortcuts */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {customVoiceShortcuts.map((sc) => (
              <div
                key={sc.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                    ⭐ "{sc.phrase}"
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    Opens {sc.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (sc.targetView === 'sanctuary') {
                        setIsSanctuaryOpen(true);
                      } else if (sc.targetView === 'breathe') {
                        setShowCalmingModal(true);
                      } else if (sc.targetView === 'call_helper') {
                        window.location.href = `tel:${profile.caregiverPhone}`;
                      } else {
                        setActiveView(sc.targetView);
                      }
                      speak(sc.responseMessage || `Opening ${sc.label}.`);
                    }}
                    className="px-2 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-bold text-[11px] hover:bg-teal-200"
                  >
                    Test
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCustomVoiceShortcut(sc.id)}
                    className="p-1 rounded-lg text-gray-400 hover:text-rose-500 transition"
                    title="Delete shortcut"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standard Spoken Commands Examples */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            Built-In Voice Commands:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {['"Go home"', '"Show tasks"', '"Show schedule"', '"Open camera"', '"Calming sanctuary"', '"I\'m lost"', '"Call helper"'].map(
              (phrase) => (
                <span
                  key={phrase}
                  className="px-2.5 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-semibold text-xs"
                >
                  {phrase}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* 3. Caregiver Lock & Helper Info */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[#2C5F8A]" />
            <h2 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
              Caregiver Connection
            </h2>
          </div>

          <span className="text-xs font-bold text-[#4CAF7D] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
            Linked
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs sm:text-sm space-y-1">
          <p>
            <strong>Primary Helper:</strong> {profile.caregiverName}
          </p>
          <p>
            <strong>Emergency Phone:</strong> {profile.caregiverPhone}
          </p>
          <p>
            <strong>Email:</strong> {profile.caregiverEmail}
          </p>
        </div>

        {!isPinUnlocked ? (
          <form onSubmit={handlePinUnlock} className="space-y-2 pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Enter Helper PIN (default: 1234) to edit connection:
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="4-digit PIN"
                className="w-32 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center font-mono font-bold text-lg outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#2C5F8A] text-white text-xs font-bold shadow hover:bg-blue-900"
              >
                Unlock
              </button>
            </div>
            {pinError && <p className="text-xs text-rose-500 font-bold">Incorrect PIN. Try 1234.</p>}
          </form>
        ) : (
          <div className="space-y-3 pt-2 animate-in fade-in">
            <span className="text-xs font-bold text-emerald-600 block">✓ Helper Controls Unlocked</span>
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Helper Name
              </label>
              <input
                type="text"
                value={profile.caregiverName}
                onChange={(e) => updateProfile({ caregiverName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Helper Phone
              </label>
              <input
                type="tel"
                value={profile.caregiverPhone}
                onChange={(e) => updateProfile({ caregiverPhone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Reset & Privacy */}
      <div className="p-4 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-3">
        <div>
          <span className="font-heading font-extrabold text-sm text-rose-900 dark:text-rose-200 block">
            Reset Sample Data
          </span>
          <span className="text-xs text-rose-700 dark:text-rose-300">
            Restore sample tasks, routine schedule, and badges
          </span>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Reset all sample tasks, schedule, and points to default?')) {
              resetAllData();
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-xs"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
};
