import React, { useState } from 'react';
import {
  CheckCircle,
  Plus,
  Play,
  Clock,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  X,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';
import { IconHelper } from '../../common/IconHelper';
import { Task } from '../../../types';

export const TaskListView: React.FC = () => {
  const { tasks, startTask, addTask, settings, openTranscriber } = useApp();
  const { speak, startListening, stopListening, isListening } = useSpeech(settings.speechSpeed);

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const activeTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(
        (transcript) => {
          setGoalInput(transcript);
          speak(`Heard: ${transcript}`);
        },
        (err) => {
          setErrorMsg('Could not hear speech clearly. Please try typing.');
        }
      );
    }
  };

  const handleDecomposeWithGemini = async (customGoal?: string) => {
    const goalToUse = customGoal || goalInput;
    if (!goalToUse.trim()) return;

    setIsDecomposing(true);
    setErrorMsg('');
    speak('Breaking down your goal into easy steps with Gemini.');

    try {
      const response = await fetch('/api/ai/decompose-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: goalToUse,
          userLevel: 'simple',
        }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: data.taskTitle || goalToUse,
        category: (data.category as any) || 'routine',
        estimatedMinutes: data.estimatedMinutes || 6,
        status: 'pending',
        isAiGenerated: true,
        steps: (data.steps || []).map((s: any, idx: number) => ({
          id: `step-${Date.now()}-${idx}`,
          stepNumber: s.stepNumber || idx + 1,
          instruction: s.instruction,
          icon: s.icon || 'Sparkles',
          completed: false,
        })),
      };

      addTask(newTask);
      setIsDecomposing(false);
      setShowCreateModal(false);
      setGoalInput('');
      speak(`Created ${newTask.title} with ${newTask.steps.length} steps.`);
    } catch (err: any) {
      console.error(err);
      // Fallback manual task creation
      const fallbackTask: Task = {
        id: `task-${Date.now()}`,
        title: goalToUse,
        category: 'routine',
        estimatedMinutes: 5,
        status: 'pending',
        steps: [
          { id: 'fb1', stepNumber: 1, instruction: 'Take a breath and get ready.', icon: 'Heart', completed: false },
          { id: 'fb2', stepNumber: 2, instruction: `Start doing ${goalToUse}.`, icon: 'Footprints', completed: false },
          { id: 'fb3', stepNumber: 3, instruction: 'Check your work and tap Done.', icon: 'CheckCircle', completed: false },
        ],
      };
      addTask(fallbackTask);
      setIsDecomposing(false);
      setShowCreateModal(false);
      setGoalInput('');
      speak(`Created ${fallbackTask.title} for you.`);
    }
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Top Header & New Task Trigger */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            One step at a time, whenever you are ready
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#4A90D9] hover:bg-[#2C5F8A] text-white font-extrabold text-sm shadow transition active:scale-95 touch-target"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Task</span>
        </button>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1.5 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'active'
              ? 'bg-white dark:bg-gray-700 text-[#2C5F8A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          To Do ({activeTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-gray-700 text-[#2C5F8A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3.5">
        {(activeTab === 'active' ? activeTasks : completedTasks).map((task) => (
          <div
            key={task.id}
            className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs flex items-center justify-between gap-3 hover:border-[#4A90D9]/50 transition"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  task.status === 'completed'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#4CAF7D]'
                    : 'bg-blue-50 dark:bg-blue-900/40 text-[#4A90D9]'
                }`}
              >
                <IconHelper name={task.steps[0]?.icon || 'CheckCircle'} size={24} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                    {task.title}
                  </h3>
                  {task.isAiGenerated && (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full shrink-0">
                      AI Steps
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{task.steps.length} micro-steps</span>
                  <span aria-hidden="true">·</span>
                  <span>~{task.estimatedMinutes} mins</span>
                  {task.completedAt && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#4CAF7D] font-bold">Done at {task.completedAt}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              {task.status !== 'completed' ? (
                <button
                  onClick={() => startTask(task.id, 0)}
                  className="px-4 py-2.5 rounded-2xl bg-[#4A90D9] hover:bg-[#2C5F8A] text-white font-extrabold text-sm flex items-center gap-1.5 shadow transition active:scale-95 touch-target"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start</span>
                </button>
              ) : (
                <button
                  onClick={() => startTask(task.id, 0)}
                  className="p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 text-xs font-bold flex items-center gap-1 touch-target"
                  title="Review or redo"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {(activeTab === 'active' ? activeTasks : completedTasks).length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E8E5DF] dark:border-gray-800">
            <CheckCircle className="w-12 h-12 text-[#4CAF7D] mx-auto mb-2 opacity-50" />
            <p className="font-heading font-bold text-base text-gray-700 dark:text-gray-300">
              {activeTab === 'active' ? 'No to-do tasks right now!' : 'No completed tasks yet.'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tap "New Task" above to add something or try a template.
            </p>
          </div>
        )}
      </div>

      {/* Task Creation Modal with Gemini AI Decomposition */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-2xl border border-gray-200 dark:border-gray-800 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-extrabold text-xl text-gray-900 dark:text-white">
                Create a New Task
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
              What do you want to do? Type it or tap the microphone to speak.
            </p>

            {/* Input with Speech-to-Text Button */}
            <div className="relative mb-2">
              <input
                type="text"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. Wash laundry, make dinner, call clinic"
                className="w-full p-3.5 pr-12 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-medium text-base focus:border-[#4A90D9] outline-none"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-2 top-2 p-2 rounded-xl transition ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-gray-500 hover:text-[#4A90D9]'
                }`}
                title={isListening ? 'Listening...' : 'Voice dictation'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between mb-4 text-xs">
              <button
                type="button"
                onClick={() =>
                  openTranscriber((text) => {
                    setGoalInput(text);
                    handleDecomposeWithGemini(text);
                  })
                }
                className="text-teal-600 dark:text-teal-400 font-bold flex items-center space-x-1 hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dictate with Gemini 3.5 Transcribe</span>
              </button>
            </div>

            {/* Quick Templates */}
            <div className="mb-5">
              <span className="text-[11px] font-bold uppercase text-gray-400 block mb-2">
                Or pick a quick routine:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Prepare for Bed & Brush Teeth',
                  'Water the House Plants',
                  'Make a Healthy Lunch Salad',
                  'Check Mailbox Outside',
                ].map((tpl) => (
                  <button
                    key={tpl}
                    onClick={() => {
                      setGoalInput(tpl);
                      handleDecomposeWithGemini(tpl);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 text-xs font-semibold text-gray-700 dark:text-gray-300 transition"
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 mb-3">{errorMsg}</p>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => handleDecomposeWithGemini()}
                disabled={isDecomposing || !goalInput.trim()}
                className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-[#4A90D9] to-[#2C5F8A] hover:brightness-105 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow transition active:scale-98 disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                <span>{isDecomposing ? 'Breaking down steps with AI...' : 'Break It Into Steps For Me'}</span>
              </button>

              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full py-2.5 text-xs text-gray-500 font-bold hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
