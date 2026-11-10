import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Trophy,
  RotateCcw,
  Home,
  Film,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';
import { IconHelper } from '../../common/IconHelper';

export const TaskStepRunner: React.FC = () => {
  const {
    tasks,
    activeTaskId,
    activeStepIndex,
    setActiveStepIndex,
    completeTaskStep,
    completeTask,
    closeTaskRunner,
    incrementStruggle,
    setShowAdaptiveModal,
    profile,
    settings,
    openVideoGuide,
  } = useApp();

  const { speak, isSpeaking } = useSpeech(settings.speechSpeed);
  const [isCompletedState, setIsCompletedState] = useState(false);

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  useEffect(() => {
    if (activeTask && activeTask.steps[activeStepIndex] && !isCompletedState) {
      const step = activeTask.steps[activeStepIndex];
      if (settings.autoRead) {
        speak(`Step ${activeStepIndex + 1} of ${activeTask.steps.length}: ${step.instruction}`);
      }
    }
  }, [activeTaskId, activeStepIndex, isCompletedState]);

  if (!activeTask) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No active task selected.</p>
        <button
          onClick={closeTaskRunner}
          className="mt-4 px-6 py-2 bg-[#4A90D9] text-white rounded-xl font-bold"
        >
          Return to Tasks
        </button>
      </div>
    );
  }

  const currentStep = activeTask.steps[activeStepIndex];
  const isFinalStep = activeStepIndex === activeTask.steps.length - 1;

  const handleNextStep = () => {
    completeTaskStep(activeTask.id, activeStepIndex);
    if (isFinalStep) {
      completeTask(activeTask.id);
      setIsCompletedState(true);
      speak(`Congratulations ${profile.preferredName || profile.name}! You finished ${activeTask.title}. 10 points earned!`);
    } else {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };

  const handlePreviousStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(activeStepIndex - 1);
    }
  };

  const handleRepeatSpeech = () => {
    if (currentStep) {
      speak(currentStep.instruction);
    }
  };

  const handleStruggleHelp = () => {
    incrementStruggle();
    setShowAdaptiveModal(true);
  };

  // Screen 13: Task Complete Celebration
  if (isCompletedState) {
    return (
      <div className="max-w-md mx-auto min-h-[75vh] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-[#4CAF7D] flex items-center justify-center mb-6 shadow-lg animate-bounce">
          <Trophy className="w-14 h-14" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-[#4CAF7D] text-sm font-black mb-3">
          <Sparkles className="w-4 h-4" />
          <span>+10 Points Added!</span>
        </div>

        <h2 className="font-heading font-black text-3xl sm:text-4xl text-gray-900 dark:text-white mb-2">
          You did it, {profile.preferredName || profile.name}!
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-sm">
          You completed all {activeTask.steps.length} steps for <strong>"{activeTask.title}"</strong>.
          Great job!
        </p>

        <div className="w-full space-y-3.5">
          <button
            onClick={closeTaskRunner}
            className="w-full min-h-[58px] rounded-2xl bg-[#4A90D9] hover:bg-[#2C5F8A] text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <button
            onClick={() => {
              setIsCompletedState(false);
              setActiveStepIndex(0);
            }}
            className="w-full min-h-[50px] rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-base flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Do this task again</span>
          </button>
        </div>
      </div>
    );
  }

  // Screen 12: Step-by-Step Runner (One task per screen)
  return (
    <div className="max-w-md mx-auto min-h-[82vh] flex flex-col justify-between p-4 sm:p-5">
      {/* Top Header: Task Title, Progress bar & Exit button */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={closeTaskRunner}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 touch-target"
            aria-label="Exit Task"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Task</span>
          </button>

          <span className="font-mono text-xs font-extrabold text-[#4A90D9] bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
            Step {activeStepIndex + 1} of {activeTask.steps.length}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-[#4A90D9] to-[#68B28A] transition-all duration-300 rounded-full"
            style={{
              width: `${((activeStepIndex + 1) / activeTask.steps.length) * 100}%`,
            }}
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
          {activeTask.title}
        </p>
      </div>

      {/* Center: Large Step Instruction & Friendly Icon */}
      <div className="my-auto text-center px-2 py-4">
        {/* Step Icon Container */}
        <div className="mx-auto w-24 h-24 rounded-3xl bg-blue-50 dark:bg-blue-900/40 text-[#4A90D9] flex items-center justify-center mb-6 shadow-xs border border-blue-100 dark:border-blue-800">
          <IconHelper name={currentStep.icon || 'Sparkles'} size={48} className="w-12 h-12" />
        </div>

        {/* Main Step Instruction */}
        <h2 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white leading-tight mb-4">
          {currentStep.instruction}
        </h2>

        {/* Audio & Video Guidance Buttons */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={handleRepeatSpeech}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition active:scale-95 touch-target ${
              isSpeaking
                ? 'bg-[#4A90D9] text-white border-[#4A90D9] animate-pulse'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50'
            }`}
            aria-label="Hear instruction again"
          >
            <Volume2 className="w-4 h-4 text-[#4A90D9]" />
            <span className="text-xs font-bold">Hear it again</span>
          </button>

          <button
            onClick={() => openVideoGuide(`${activeTask.title}: ${currentStep.instruction}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition active:scale-95 touch-target"
            aria-label="Watch AI video demonstration of this step"
          >
            <Film className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold">Watch Video Demo</span>
          </button>
        </div>
      </div>

      {/* Bottom Actions: Next Step, Previous Step, and Adaptive Help */}
      <div className="space-y-3 pt-4">
        {/* Primary Next Action (>= 58px touch target) */}
        <button
          onClick={handleNextStep}
          className="w-full min-h-[58px] rounded-2xl bg-[#4CAF7D] hover:bg-[#3d9366] text-white font-extrabold text-lg flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition"
        >
          <CheckCircle className="w-6 h-6 stroke-[2.5]" />
          <span>{isFinalStep ? 'Finish Task!' : 'Done — Next Step'}</span>
        </button>

        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Go Back button */}
          <button
            onClick={handlePreviousStep}
            disabled={activeStepIndex === 0}
            className={`flex-1 min-h-[46px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5 transition ${
              activeStepIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 active:scale-95'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>

          {/* I Need Help button (Triggers adaptive modal) */}
          <button
            onClick={handleStruggleHelp}
            className="flex-1 min-h-[46px] rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>I need help</span>
          </button>
        </div>
      </div>
    </div>
  );
};
