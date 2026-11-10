import React, { useState } from 'react';
import {
  CheckCircle,
  Plus,
  Sparkles,
  Trash2,
  Clock,
  Layers,
  X,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';
import { Task } from '../../../types';

export const CaregiverTaskManager: React.FC = () => {
  const { tasks, addTask, updateTask, settings } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  const [showCreate, setShowCreate] = useState(false);
  const [taskGoal, setTaskGoal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDecomposeAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskGoal.trim()) return;

    setIsProcessing(true);
    speak('Using Gemini AI to decompose task into visual micro-steps.');

    try {
      const response = await fetch('/api/ai/decompose-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: taskGoal,
          userLevel: 'simple',
        }),
      });

      const data = await response.json();
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: data.taskTitle || taskGoal,
        category: (data.category as any) || 'routine',
        estimatedMinutes: data.estimatedMinutes || 6,
        status: 'pending',
        isCaregiverAdded: true,
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
      setIsProcessing(false);
      setShowCreate(false);
      setTaskGoal('');
      speak(`Task created with ${newTask.steps.length} steps.`);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl text-gray-900 dark:text-white">
            Task Step Manager
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Create tasks broken into micro-steps for Alex
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2C5F8A] text-white font-bold text-xs shadow hover:bg-blue-900"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Task (AI Breakdown)</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-lg text-gray-900 dark:text-white">
                  {task.title}
                </h3>
                <span className="text-xs text-gray-400 font-semibold">
                  ~{task.estimatedMinutes} mins · {task.steps.length} micro-steps · Status: {task.status}
                </span>
              </div>

              {task.isAiGenerated && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  AI Decomposed
                </span>
              )}
            </div>

            {/* Steps Preview List */}
            <div className="space-y-1.5 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
              <span className="text-[11px] font-extrabold uppercase text-gray-400 tracking-wider block mb-1">
                Steps shown to Alex:
              </span>
              {task.steps.map((st, i) => (
                <div key={st.id || i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-mono font-bold text-[#2C5F8A] w-4">{i + 1}.</span>
                  <span>{st.instruction}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                Create Task with Gemini
              </h3>
              <button onClick={() => setShowCreate(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleDecomposeAndSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Goal to Break Down
                </label>
                <input
                  type="text"
                  required
                  value={taskGoal}
                  onChange={(e) => setTaskGoal(e.target.value)}
                  placeholder="e.g. Clean the kitchen counter"
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isProcessing || !taskGoal.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2C5F8A] to-[#4A90D9] text-white font-bold text-sm shadow flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isProcessing ? 'Generating Steps...' : 'Decompose & Save'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
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
