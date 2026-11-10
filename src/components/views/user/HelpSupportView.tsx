import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  Volume2,
  Phone,
  Heart,
  Camera,
  Compass,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

export const HelpSupportView: React.FC = () => {
  const { profile, settings } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I start a task?',
      a: 'Tap Tasks in the bottom menu, or tap "Start Now" on your home screen. EasyPath will show you one step at a time with big buttons.',
    },
    {
      q: 'How does the Camera Helper explain things?',
      a: 'Tap the amber Camera button at the bottom. Point your phone at a paper letter, medicine label, or item, and tap the shutter. Gemini will explain it in simple words and read it aloud.',
    },
    {
      q: 'What happens if I press "I\'m Lost"?',
      a: 'A gentle alert with your location is sent immediately to your helper Sarah. The app tells you where you are and gives you a 1-tap button to call your helper directly.',
    },
    {
      q: 'Can I change the text size or colors?',
      a: 'Yes! Tap Profile, then Settings. You can choose Normal, Large, or Extra Large text, and switch to High Contrast or Warm colors anytime.',
    },
  ];

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">
          Help & Easy Guides
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Answers to common questions in plain language
        </p>
      </div>

      {/* Helper Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2C5F8A] dark:text-blue-300 block mb-0.5">
            Need direct help?
          </span>
          <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
            Call your helper {profile.caregiverName}
          </h3>
          <span className="text-xs text-gray-500">{profile.caregiverPhone}</span>
        </div>

        <a
          href={`tel:${profile.caregiverPhone}`}
          className="px-4 py-2.5 rounded-2xl bg-[#4CAF7D] text-white font-extrabold text-xs flex items-center gap-1.5 shadow"
        >
          <Phone className="w-4 h-4 fill-current" />
          <span>Call Now</span>
        </a>
      </div>

      {/* Accordion FAQ list */}
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <div
              key={index}
              className="rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs overflow-hidden"
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left touch-target font-heading font-extrabold text-base text-gray-900 dark:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180 text-[#4A90D9]' : ''
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-800">
                  <p className="mb-3">{faq.a}</p>
                  <button
                    onClick={() => speak(`${faq.q}. ${faq.a}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#4A90D9] text-xs font-bold hover:bg-blue-100"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read this answer aloud</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
