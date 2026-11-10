import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Volume2,
  CheckCircle,
  Home,
  Building,
  TreePine,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

interface NavStep {
  stepNumber: number;
  instruction: string;
  landmark: string;
  direction: 'forward' | 'left' | 'right' | 'arrive';
}

const presetDestinations: Record<string, { title: string; icon: any; steps: NavStep[] }> = {
  home: {
    title: 'Walk to Home',
    icon: Home,
    steps: [
      { stepNumber: 1, instruction: 'Head toward Main Street sidewalk.', landmark: 'Crosswalk with audible beeping signal', direction: 'forward' },
      { stepNumber: 2, instruction: 'Turn right at the big green tree.', landmark: 'Green oak tree & wooden park bench', direction: 'right' },
      { stepNumber: 3, instruction: 'Walk 50 steps until you see the red front door.', landmark: 'Red front door with blue flower pot', direction: 'arrive' },
    ],
  },
  clinic: {
    title: 'Dr. Wilson Clinic',
    icon: Building,
    steps: [
      { stepNumber: 1, instruction: 'Walk down Elm Street past the library.', landmark: 'Brick building with white pillars', direction: 'forward' },
      { stepNumber: 2, instruction: 'Turn left at the blue pharmacy awning.', landmark: 'Blue pharmacy sign', direction: 'left' },
      { stepNumber: 3, instruction: 'Enter through the automatic glass sliding doors.', landmark: 'Clinic reception desk', direction: 'arrive' },
    ],
  },
  park: {
    title: 'Sunshine Park',
    icon: TreePine,
    steps: [
      { stepNumber: 1, instruction: 'Cross at the pedestrian traffic light.', landmark: 'Striped pedestrian crossing', direction: 'forward' },
      { stepNumber: 2, instruction: 'Follow the paved walkway toward the fountain.', landmark: 'Water fountain with stone turtles', direction: 'forward' },
      { stepNumber: 3, instruction: 'Arrived at the park pavilion.', landmark: 'Covered seating area', direction: 'arrive' },
    ],
  },
  shop: {
    title: 'Local Corner Grocery',
    icon: ShoppingBag,
    steps: [
      { stepNumber: 1, instruction: 'Walk straight down Oak Avenue.', landmark: 'Yellow post box on corner', direction: 'forward' },
      { stepNumber: 2, instruction: 'Turn right after the post box.', landmark: 'Green grocery fruit display outside', direction: 'right' },
      { stepNumber: 3, instruction: 'Enter the front door to shop.', landmark: 'Store entrance', direction: 'arrive' },
    ],
  },
};

export const SafeNavigationView: React.FC = () => {
  const { triggerImLost, settings } = useApp();
  const { speak, isSpeaking } = useSpeech(settings.speechSpeed);

  const [activeRouteKey, setActiveRouteKey] = useState<string | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [hasArrived, setHasArrived] = useState(false);

  const currentRoute = activeRouteKey ? presetDestinations[activeRouteKey] : null;
  const currentStep = currentRoute ? currentRoute.steps[currentStepIdx] : null;

  const startRoute = (key: string) => {
    setActiveRouteKey(key);
    setCurrentStepIdx(0);
    setHasArrived(false);
    const firstStep = presetDestinations[key].steps[0];
    speak(`Starting route to ${presetDestinations[key].title}. Step 1: ${firstStep.instruction}`);
  };

  const handleNextStep = () => {
    if (!currentRoute) return;
    if (currentStepIdx < currentRoute.steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      speak(`Step ${nextIdx + 1}: ${currentRoute.steps[nextIdx].instruction}`);
    } else {
      setHasArrived(true);
      speak('Wonderful! You have safely arrived at your destination.');
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIdx > 0 && currentRoute) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      speak(`Back to Step ${prevIdx + 1}: ${currentRoute.steps[prevIdx].instruction}`);
    }
  };

  const handleLostTap = () => {
    triggerImLost(
      currentStep
        ? `Near ${currentStep.landmark} during route to ${currentRoute?.title}`
        : 'Walking near neighborhood center'
    );
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">
            Safe Walk & Navigation
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Clear landmark directions — no complicated maps
          </p>
        </div>

        {activeRouteKey && (
          <button
            onClick={() => setActiveRouteKey(null)}
            className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            Change Route
          </button>
        )}
      </div>

      {!activeRouteKey ? (
        /* Destination Selector */
        <div className="space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
            Choose Where You Want To Go:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {Object.entries(presetDestinations).map(([key, item]) => {
              const IconComp = item.icon;
              return (
                <button
                  key={key}
                  onClick={() => startRoute(key)}
                  className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs hover:border-[#4A90D9] transition flex items-center justify-between text-left group touch-target"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-[#4A90D9] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-base text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.steps.length} landmark checkpoints
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#4A90D9]" />
                </button>
              );
            })}
          </div>
        </div>
      ) : hasArrived ? (
        /* Arrival Confirmation */
        <div className="p-8 text-center bg-white dark:bg-[#1E293B] rounded-3xl border-2 border-[#4CAF7D] shadow-md animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-[#4CAF7D] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 stroke-[2.5]" />
          </div>
          <h2 className="font-heading font-black text-2xl text-gray-900 dark:text-white mb-2">
            You Have Arrived!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
            You completed the walk to <strong>{currentRoute?.title}</strong> safely.
          </p>
          <button
            onClick={() => setActiveRouteKey(null)}
            className="w-full py-3.5 rounded-2xl bg-[#4A90D9] text-white font-extrabold text-base shadow"
          >
            Choose Another Destination
          </button>
        </div>
      ) : (
        /* Active Route Step-by-Step View */
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border-2 border-[#4A90D9]/30 shadow-md space-y-5">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-[#4A90D9]">
              {currentRoute?.title}
            </span>
            <span className="font-mono text-xs font-black bg-blue-50 dark:bg-blue-900/40 text-[#4A90D9] px-3 py-1 rounded-full">
              Step {currentStepIdx + 1} of {currentRoute?.steps.length}
            </span>
          </div>

          {/* Directional Landmark Card */}
          {currentStep && (
            <div className="text-center py-4">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/40 text-[#4A90D9] flex items-center justify-center mb-4 shadow-xs">
                <Compass className="w-10 h-10 animate-spin-slow" />
              </div>

              <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white mb-2 leading-snug">
                {currentStep.instruction}
              </h3>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs font-bold text-amber-900 dark:text-amber-200 mb-4">
                <MapPin className="w-4 h-4 text-[#F5A623] shrink-0" />
                <span>Look for: {currentStep.landmark}</span>
              </div>

              <div>
                <button
                  onClick={() => speak(`${currentStep.instruction}. Look for: ${currentStep.landmark}`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#4A90D9]" />
                  <span>Hear again</span>
                </button>
              </div>
            </div>
          )}

          {/* Forward / Back Navigation */}
          <div className="space-y-2.5">
            <button
              onClick={handleNextStep}
              className="w-full min-h-[56px] rounded-2xl bg-[#4CAF7D] hover:bg-[#3d9366] text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-md transition active:scale-98"
            >
              <CheckCircle className="w-5 h-5" />
              <span>
                {currentStepIdx === (currentRoute?.steps.length || 0) - 1
                  ? "I've Arrived!"
                  : 'I Completed This Step — Next'}
              </span>
            </button>

            {currentStepIdx > 0 && (
              <button
                onClick={handlePreviousStep}
                className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Prominent ALWAYS-VISIBLE Red "I'M LOST" Safety Button */}
      <div className="pt-2">
        <button
          onClick={handleLostTap}
          className="w-full min-h-[64px] rounded-3xl bg-gradient-to-r from-[#E8695A] to-[#D62828] text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-xl hover:brightness-105 active:scale-98 transition"
          aria-label="I am lost emergency button"
        >
          <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
          <span>I'M LOST — ALERT MY HELPER</span>
        </button>
        <p className="text-center text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-medium">
          Pressing this shares your location with your helper and offers a direct phone call.
        </p>
      </div>
    </div>
  );
};
