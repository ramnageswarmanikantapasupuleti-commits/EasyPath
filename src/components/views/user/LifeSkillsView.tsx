import React, { useState } from 'react';
import {
  Award,
  Play,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Volume2,
  Sparkles,
  ShoppingBag,
  Phone,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';
import { LifeSkillModule } from '../../../types';

export const LifeSkillsView: React.FC = () => {
  const { lifeSkills, completeLifeSkill, settings, profile } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  const [activeModule, setActiveModule] = useState<LifeSkillModule | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const startModule = (mod: LifeSkillModule) => {
    setActiveModule(mod);
    setCurrentStepIdx(0);
    setFeedback(null);
    setIsCompleted(false);
    speak(`Starting ${mod.title}. ${mod.scenario}`);
  };

  const handleChoice = (isCorrect: boolean, feedbackText: string) => {
    setFeedback(feedbackText);
    speak(feedbackText);
  };

  const handleNextStep = () => {
    if (!activeModule) return;
    setFeedback(null);
    if (currentStepIdx < activeModule.steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      speak(`Step ${nextIdx + 1}: ${activeModule.steps[nextIdx].instruction}`);
    } else {
      setIsCompleted(true);
      completeLifeSkill(activeModule.id);
      speak(`Module complete! You earned the ${activeModule.badgeReward} badge!`);
    }
  };

  const currentStep = activeModule ? activeModule.steps[currentStepIdx] : null;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">
          Life-Skills Coach
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Safe, friendly practice for everyday real-world situations
        </p>
      </div>

      {!activeModule ? (
        /* Modules List */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {lifeSkills.map((mod) => (
            <div
              key={mod.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs flex flex-col justify-between hover:border-[#4A90D9]/50 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#68B28A] flex items-center justify-center">
                    {mod.icon === 'Phone' ? <Phone className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
                  </div>
                  {mod.completed && (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#4CAF7D] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-black text-lg text-gray-900 dark:text-white mb-1.5">
                  {mod.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {mod.scenario}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold text-gray-400">
                  {mod.steps.length} interactive steps
                </span>

                <button
                  onClick={() => startModule(mod)}
                  className="px-4 py-2 rounded-xl bg-[#4A90D9] hover:bg-[#2C5F8A] text-white font-extrabold text-xs flex items-center gap-1.5 shadow transition active:scale-95 touch-target"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{mod.completed ? 'Practice Again' : 'Start Practice'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : isCompleted ? (
        /* Completion Screen */
        <div className="p-8 text-center bg-white dark:bg-[#1E293B] rounded-3xl border-2 border-[#4CAF7D] shadow-md animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-[#4CAF7D] flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Award className="w-12 h-12 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-[#4CAF7D] text-xs font-black mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Badge Earned: {activeModule.badgeReward}</span>
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white mb-2">
            Awesome Job, {profile.preferredName || profile.name}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 max-w-sm mx-auto">
            You practiced <strong>"{activeModule.title}"</strong> with great confidence. 15 points added to your score!
          </p>

          <button
            onClick={() => setActiveModule(null)}
            className="w-full py-3.5 rounded-2xl bg-[#4A90D9] text-white font-extrabold text-base shadow"
          >
            Back to Life Skills Modules
          </button>
        </div>
      ) : (
        /* Step-by-Step Simulation View */
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border-2 border-[#4A90D9]/30 shadow-md space-y-5">
          {/* Top Step Counter */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveModule(null)}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Exit Module</span>
            </button>

            <span className="font-mono text-xs font-black bg-blue-50 dark:bg-blue-900/40 text-[#4A90D9] px-3 py-1 rounded-full">
              Step {currentStepIdx + 1} of {activeModule.steps.length}
            </span>
          </div>

          {currentStep && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Scenario:
                </span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {currentStep.contextDesc}
                </p>
              </div>

              <h3 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white leading-snug">
                {currentStep.instruction}
              </h3>

              {/* Multiple Choice Decision Points (if applicable) */}
              {currentStep.choices && currentStep.choices.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    What would you do?
                  </span>
                  {currentStep.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleChoice(choice.isCorrect, choice.feedback)}
                      className="w-full p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1E293B] hover:border-[#4A90D9] text-left font-bold text-sm text-gray-800 dark:text-gray-200 transition active:scale-98 shadow-xs"
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Feedback Alert */}
              {feedback && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 animate-in fade-in">
                  ✓ {feedback}
                </div>
              )}
            </div>
          )}

          {/* Next Button */}
          <button
            onClick={handleNextStep}
            className="w-full min-h-[54px] rounded-2xl bg-[#4CAF7D] hover:bg-[#3d9366] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <CheckCircle className="w-5 h-5" />
            <span>
              {currentStepIdx === activeModule.steps.length - 1
                ? 'Complete Practice!'
                : 'Next Step'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
