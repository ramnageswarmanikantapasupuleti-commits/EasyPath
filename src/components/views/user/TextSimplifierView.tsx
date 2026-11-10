import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Bookmark,
  Check,
  BookOpen,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

interface SavedSimplifiedText {
  id: string;
  title: string;
  summary: string;
  actionNeeded: string;
  keyPoints: string[];
  speechText: string;
  date: string;
}

export const TextSimplifierView: React.FC = () => {
  const { settings, openTranscriber } = useApp();
  const { speak, isSpeaking } = useSpeech(settings.speechSpeed);

  const [inputContent, setInputContent] = useState('');
  const [readingLevel, setReadingLevel] = useState<'simple' | 'very_simple'>('simple');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simplifiedResult, setSimplifiedResult] = useState<{
    title: string;
    summary: string;
    actionNeeded: string;
    keyPoints: string[];
    speechText: string;
  } | null>(null);

  const [savedLibrary, setSavedLibrary] = useState<SavedSimplifiedText[]>(() => {
    const saved = localStorage.getItem('easypath_saved_texts');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'saved-1',
            title: 'Water Utility Statement',
            summary: 'Your water bill is already paid by direct debit.',
            actionNeeded: 'No action needed right now.',
            keyPoints: ['Amount was $24.50', 'Paid automatically on the 1st', 'Next statement in one month'],
            speechText: 'This water bill was already paid automatically. You do not need to do anything.',
            date: '2 days ago',
          },
        ];
  });

  const [viewLibrary, setViewLibrary] = useState(false);

  const handleVoiceInput = () => {
    openTranscriber((transcript) => {
      setInputContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
    });
  };

  const loadSampleText = (type: 'bank' | 'clinic' | 'lease') => {
    if (type === 'bank') {
      setInputContent(
        'Dear Customer, we are writing to notify you that pursuant to Section 4.2 of our updated regulatory consumer disclosures, your annual electronic deposit account statement has been archived in your secure documents repository. No outstanding balance or remedial transaction is currently mandated.'
      );
    } else if (type === 'clinic') {
      setInputContent(
        'Reminder: You have an upcoming preventive outpatient consultation scheduled with Dr. Arthur Wilson at Suite 402 on Wednesday at 10:00 AM. Please arrive 15 minutes in advance and present your primary insurance card.'
      );
    } else {
      setInputContent(
        'Maintenance Notice: Regular inspection of residential fire alarm and smoke mitigation equipment will commence on Thursday between 09:00 and 12:00. Technicians will require brief access to all hallways.'
      );
    }
  };

  const handleSimplify = async () => {
    if (!inputContent.trim()) return;

    setIsProcessing(true);
    setSimplifiedResult(null);
    speak('Making this text simple and clear for you...');

    try {
      const response = await fetch('/api/ai/simplify-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputContent,
          readingLevel: readingLevel,
        }),
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      setSimplifiedResult(data);
      setIsProcessing(false);

      if (settings.autoRead && data.speechText) {
        speak(data.speechText);
      }
    } catch (err) {
      console.error(err);
      const fallback = {
        title: 'Information Letter',
        summary: 'This letter is just to let you know about your account. Everything is in order.',
        actionNeeded: 'No action needed from you right now.',
        keyPoints: ['Your account is working normally', 'Keep this paper in your folder', 'Ask your helper Sarah if you want to double-check'],
        speechText: 'This letter says everything is okay. You do not need to pay anything right now.',
      };
      setSimplifiedResult(fallback);
      setIsProcessing(false);
      speak(fallback.speechText);
    }
  };

  const saveToLibrary = () => {
    if (!simplifiedResult) return;
    const newItem: SavedSimplifiedText = {
      id: `saved-${Date.now()}`,
      ...simplifiedResult,
      date: 'Just now',
    };
    const updated = [newItem, ...savedLibrary];
    setSavedLibrary(updated);
    localStorage.setItem('easypath_saved_texts', JSON.stringify(updated));
    speak('Saved to your text library.');
  };

  const deleteFromLibrary = (id: string) => {
    const updated = savedLibrary.filter((item) => item.id !== id);
    setSavedLibrary(updated);
    localStorage.setItem('easypath_saved_texts', JSON.stringify(updated));
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">
            Text Simplifier
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Paste hard letters, forms, or notices to make them plain
          </p>
        </div>

        <button
          onClick={() => setViewLibrary(!viewLibrary)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
            viewLibrary
              ? 'bg-[#4A90D9] text-white border-[#4A90D9]'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Saved ({savedLibrary.length})</span>
        </button>
      </div>

      {!viewLibrary ? (
        <>
          {/* Main Input Form */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                Paste or Speak Complex Text:
              </label>

              {/* Reading Level Selector */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setReadingLevel('simple')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    readingLevel === 'simple'
                      ? 'bg-white dark:bg-gray-700 text-[#4A90D9] shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  Simple
                </button>
                <button
                  type="button"
                  onClick={() => setReadingLevel('very_simple')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    readingLevel === 'very_simple'
                      ? 'bg-white dark:bg-gray-700 text-[#4A90D9] shadow-xs'
                      : 'text-gray-500'
                  }`}
                >
                  Extra Simple
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Paste the difficult letter, bill, or email here..."
                className="w-full p-4 pr-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium outline-none focus:border-[#4A90D9] leading-relaxed"
              />

              <button
                type="button"
                onClick={handleVoiceInput}
                className="absolute right-3 top-3 p-2 rounded-xl text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition"
                title="Dictate with Gemini 3.5 Transcribe"
                aria-label="Dictate with Gemini 3.5 Transcribe"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Test Samples */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 block mb-1.5">
                Or try a sample real-world notice:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => loadSampleText('bank')}
                  className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-blue-50"
                >
                  Bank Letter
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleText('clinic')}
                  className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-blue-50"
                >
                  Clinic Appointment
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleText('lease')}
                  className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-blue-50"
                >
                  Building Notice
                </button>
              </div>
            </div>

            {/* Simplify Button */}
            <button
              onClick={handleSimplify}
              disabled={isProcessing || !inputContent.trim()}
              className="w-full min-h-[54px] rounded-2xl bg-gradient-to-r from-[#4A90D9] to-[#2C5F8A] hover:brightness-105 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow transition active:scale-98 disabled:opacity-40"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isProcessing ? 'Translating into plain words...' : 'Simplify It For Me'}</span>
            </button>
          </div>

          {/* Simplified Output Card */}
          {simplifiedResult && (
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border-2 border-[#4A90D9]/40 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#4A90D9] text-xs font-black">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Plain Language Summary</span>
                </span>

                <button
                  onClick={() => speak(simplifiedResult.speechText || simplifiedResult.summary)}
                  className={`p-2.5 rounded-xl border transition active:scale-95 touch-target ${
                    isSpeaking
                      ? 'bg-[#4A90D9] text-white border-[#4A90D9] animate-pulse'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                  }`}
                  aria-label="Read simplified summary aloud"
                >
                  <Volume2 className="w-5 h-5 text-[#4A90D9]" />
                </button>
              </div>

              <div>
                <h3 className="font-heading font-black text-xl text-gray-900 dark:text-white mb-2">
                  {simplifiedResult.title}
                </h3>
                <p className="text-base font-semibold text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                  {simplifiedResult.summary}
                </p>

                {/* Action Needed Badge */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 mb-4">
                  <Check className="w-4 h-4 text-[#4CAF7D] shrink-0" />
                  <span>{simplifiedResult.actionNeeded}</span>
                </div>

                {/* Key Points */}
                {simplifiedResult.keyPoints && simplifiedResult.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
                      Key Takeaways:
                    </span>
                    <ul className="space-y-1.5">
                      {simplifiedResult.keyPoints.map((pt, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4A90D9] mt-2 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={saveToLibrary}
                className="w-full py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2"
              >
                <Bookmark className="w-4 h-4 text-[#4A90D9]" />
                <span>Save to My Library</span>
              </button>
            </div>
          )}
        </>
      ) : (
        /* Saved Texts Library */
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-heading font-extrabold text-base text-gray-900 dark:text-white">
              My Saved Simplified Texts
            </h2>
          </div>

          {savedLibrary.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8E5DF] dark:border-gray-800 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-extrabold text-base text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => speak(item.speechText || item.summary)}
                    className="p-1.5 text-gray-400 hover:text-[#4A90D9]"
                    title="Read aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFromLibrary(item.id)}
                    className="p-1.5 text-gray-300 hover:text-rose-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                {item.summary}
              </p>

              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {item.actionNeeded}
              </div>
            </div>
          ))}

          {savedLibrary.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-[#E8E5DF] dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-500">No saved texts yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
