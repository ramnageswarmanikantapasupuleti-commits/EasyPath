import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Command,
  X,
  Volume2,
  CheckCircle,
  HelpCircle,
  Navigation,
  Activity,
  Plus,
  Trash2,
  Calendar,
  Smile,
  Check,
  Camera,
  Compass,
  FileText,
  Users,
  Award,
  Heart,
  Phone,
  Bookmark,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  Play,
  Send,
  Info,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useSpeech, playGentleChime } from '../../hooks/useSpeech';
import {
  VOICE_COMMANDS,
  matchVoiceCommand,
  VoiceCommandAction,
} from '../../services/voiceCommandService';
import { CustomVoiceShortcut, VoiceTargetView } from '../../types';

const TARGET_VIEW_OPTIONS: {
  id: VoiceTargetView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultPhrase: string;
  defaultResponse: string;
}[] = [
  {
    id: 'schedule',
    label: 'My Schedule',
    icon: Calendar,
    defaultPhrase: 'My schedule',
    defaultResponse: 'Opening your daily schedule.',
  },
  {
    id: 'mood',
    label: 'Mood Check',
    icon: Smile,
    defaultPhrase: 'Mood check',
    defaultResponse: 'Opening mood check in. How are you feeling?',
  },
  {
    id: 'tasks',
    label: 'My Tasks',
    icon: CheckCircle,
    defaultPhrase: 'My daily tasks',
    defaultResponse: 'Here are your steps for today.',
  },
  {
    id: 'camera_helper',
    label: 'Camera Helper',
    icon: Camera,
    defaultPhrase: 'Explain this item',
    defaultResponse: 'Opening Camera Helper. Point at the item.',
  },
  {
    id: 'sanctuary',
    label: '3D Calming Sanctuary',
    icon: Sparkles,
    defaultPhrase: 'Go to my garden',
    defaultResponse: 'Opening your peaceful 3D garden and soothing water.',
  },
  {
    id: 'navigation',
    label: 'Safe Walk',
    icon: Compass,
    defaultPhrase: 'Take me home',
    defaultResponse: 'Opening Safe Walk landmark navigation.',
  },
  {
    id: 'simplify',
    label: 'Text Simplifier',
    icon: FileText,
    defaultPhrase: 'Read this notice',
    defaultResponse: 'Opening Text Simplifier to explain in plain words.',
  },
  {
    id: 'breathe',
    label: 'Calm Breathing',
    icon: Heart,
    defaultPhrase: 'Help me breathe',
    defaultResponse: 'Starting gentle breathing circle with you.',
  },
  {
    id: 'memory_aid',
    label: 'Memory Aid',
    icon: Users,
    defaultPhrase: 'Show my people',
    defaultResponse: 'Opening your familiar contacts and items.',
  },
  {
    id: 'call_helper',
    label: 'Call Helper',
    icon: Phone,
    defaultPhrase: 'Call my helper',
    defaultResponse: 'Calling your helper now.',
  },
];

export const GlobalVoiceCommander: React.FC = () => {
  const appContext = useApp();
  const {
    settings,
    openTranscriber,
    customVoiceShortcuts,
    addCustomVoiceShortcut,
    deleteCustomVoiceShortcut,
  } = appContext;
  const { speak } = useSpeech(settings.speechSpeed);

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [matchedActionName, setMatchedActionName] = useState<string | null>(null);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [activeTab, setActiveTab] = useState<'custom' | 'standard' | 'troubleshoot'>('custom');
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [simulationText, setSimulationText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // New Shortcut Form State
  const [isCreatingShortcut, setIsCreatingShortcut] = useState(false);
  const [newPhrase, setNewPhrase] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<VoiceTargetView>('schedule');
  const [newLabel, setNewLabel] = useState('My Schedule');
  const [newResponse, setNewResponse] = useState('Opening your daily schedule.');

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);

  const startVoiceControl = async () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setRecognitionError('unsupported');
      setShowTroubleshoot(true);
      setShowCheatSheet(true);
      return;
    }

    // Pre-flight check: try requesting microphone permission explicitly first
    if (navigator?.mediaDevices?.getUserMedia) {
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Close tracks immediately after permission check
        testStream.getTracks().forEach((track) => track.stop());
      } catch (micErr: any) {
        console.warn('Microphone permission check failed:', micErr);
        if (
          micErr.name === 'NotAllowedError' ||
          micErr.name === 'PermissionDeniedError' ||
          micErr.name === 'SecurityError'
        ) {
          setRecognitionError('not-allowed');
          setShowTroubleshoot(true);
          setShowCheatSheet(true);
          setIsListening(false);
          shouldListenRef.current = false;
          return;
        }
      }
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        shouldListenRef.current = true;
        setRecognitionError(null);
        setShowTroubleshoot(false);
        playGentleChime('chime');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        setInterimTranscript(currentInterim);

        if (currentFinal) {
          const cleanFinal = currentFinal.trim();
          setLastTranscript(cleanFinal);
          setInterimTranscript('');

          // Match custom user-defined shortcuts and standard commands
          const matched = matchVoiceCommand(cleanFinal, customVoiceShortcuts);
          if (matched) {
            setMatchedActionName(matched.command);
            playGentleChime('success');
            matched.action({ ...appContext, speak });
            setTimeout(() => {
              setMatchedActionName(null);
            }, 3000);
          } else {
            setMatchedActionName(null);
            playGentleChime('alert');
            speak(`Heard: "${cleanFinal}". Try "My schedule", "Mood check", or "Go home".`);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.debug('Speech recognition event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setRecognitionError('not-allowed');
          setShowTroubleshoot(true);
          setShowCheatSheet(true);
          shouldListenRef.current = false;
          setIsListening(false);
        } else if (event.error !== 'no-speech') {
          setRecognitionError(`Speech recognition: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (shouldListenRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            shouldListenRef.current = false;
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition', err);
      setRecognitionError('not-allowed');
      setShowTroubleshoot(true);
      setShowCheatSheet(true);
      setIsListening(false);
      shouldListenRef.current = false;
    }
  };

  const stopVoiceControl = () => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setInterimTranscript('');
    playGentleChime('chime');
  };

  const handleSimulateCommand = (phraseToTest?: string) => {
    const query = (phraseToTest !== undefined ? phraseToTest : simulationText).trim();
    if (!query) return;

    setLastTranscript(query);
    const matched = matchVoiceCommand(query, customVoiceShortcuts);

    if (matched) {
      setMatchedActionName(matched.command);
      playGentleChime('success');
      matched.action({ ...appContext, speak });
      setSimulationText('');
      setShowCheatSheet(false);
    } else {
      playGentleChime('alert');
      speak(`Could not match "${query}". Try "My schedule", "Mood check", or "Go home".`);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopVoiceControl();
    } else {
      startVoiceControl();
    }
  };

  const executeManualCommand = (cmd: VoiceCommandAction) => {
    cmd.action({ ...appContext, speak });
    setShowCheatSheet(false);
  };

  const handleSelectTargetView = (targetId: VoiceTargetView) => {
    setSelectedTarget(targetId);
    const option = TARGET_VIEW_OPTIONS.find((o) => o.id === targetId);
    if (option) {
      setNewLabel(option.label);
      if (!newPhrase) setNewPhrase(option.defaultPhrase);
      setNewResponse(option.defaultResponse);
    }
  };

  const handleSaveCustomShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhrase.trim()) return;

    addCustomVoiceShortcut({
      phrase: newPhrase.trim(),
      targetView: selectedTarget,
      label: newLabel.trim() || 'Custom Shortcut',
      responseMessage: newResponse.trim() || `Opening ${newLabel}.`,
    });

    setIsCreatingShortcut(false);
    setNewPhrase('');
  };

  const filteredStandardCommands = VOICE_COMMANDS.filter((cmd) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      cmd.command.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.aliases.some((a) => a.toLowerCase().includes(q))
    );
  });

  const filteredCustomShortcuts = customVoiceShortcuts.filter((sc) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      sc.phrase.toLowerCase().includes(q) ||
      sc.label.toLowerCase().includes(q) ||
      (sc.responseMessage && sc.responseMessage.toLowerCase().includes(q))
    );
  });

  return (
    <>
      {/* 1. Header Voice Recognition Pill Button */}
      <div className="fixed top-16 right-4 z-40 flex items-center gap-2">
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl shadow-lg transition active:scale-95 touch-target ${
            isListening
              ? 'bg-rose-500 hover:bg-rose-600 text-white ring-4 ring-rose-400/40'
              : 'bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
          }`}
          aria-label={isListening ? 'Turn off voice recognition' : 'Turn on voice recognition'}
          title="Voice recognition commands (e.g. 'My Schedule', 'Mood Check')"
        >
          {isListening ? (
            <>
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-1 bg-white rounded-full animate-bounce h-3" />
                <span className="w-1 bg-white rounded-full animate-bounce h-4 delay-75" />
                <span className="w-1 bg-white rounded-full animate-bounce h-2 delay-150" />
              </div>
              <MicOff className="w-4 h-4 stroke-[2.5]" />
            </>
          ) : (
            <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400 stroke-[2.5]" />
          )}
          <span className="text-xs font-black">
            {isListening ? 'Voice On' : 'Voice Nav'}
          </span>
        </button>

        {/* Shortcuts & Guide Button */}
        <button
          onClick={() => setShowCheatSheet(true)}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white shadow-md touch-target relative"
          title="View and customize voice shortcuts"
          aria-label="View voice shortcuts"
        >
          <Command className="w-4 h-4" />
          {customVoiceShortcuts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {customVoiceShortcuts.length}
            </span>
          )}
        </button>
      </div>

      {/* 2. Real-Time Active Voice Recognition Floating HUD Banner */}
      {isListening && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-xl animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-slate-900/95 text-white border-2 border-teal-500 rounded-3xl p-4 shadow-2xl flex flex-col space-y-3">
            {/* Header row with audio wave and status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-teal-400">
                      Voice Recognition Active
                    </span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Listening for your custom voice shortcuts
                  </p>
                </div>
              </div>

              <button
                onClick={stopVoiceControl}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                aria-label="Stop voice recognition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Transcript Display Box */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 min-h-[46px] flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-100 flex-1 pr-2 truncate">
                {matchedActionName ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Action: {matchedActionName}</span>
                  </span>
                ) : interimTranscript ? (
                  <span className="italic text-teal-300">"{interimTranscript}..."</span>
                ) : lastTranscript ? (
                  <span className="text-white">"{lastTranscript}"</span>
                ) : (
                  <span className="text-slate-400 font-normal">
                    Speak your shortcut (e.g. "My schedule" or "Mood check")...
                  </span>
                )}
              </div>
            </div>

            {/* Quick 1-Tap Custom & Standard Shortcuts Carousel */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs select-none no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pr-1">
                Say or Tap:
              </span>
              {customVoiceShortcuts.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    const matched = matchVoiceCommand(sc.phrase, customVoiceShortcuts);
                    if (matched) executeManualCommand(matched);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-teal-900/60 hover:bg-teal-600 text-teal-200 hover:text-white border border-teal-500/40 font-semibold shrink-0 transition"
                >
                  ⭐ "{sc.phrase}"
                </button>
              ))}
              {VOICE_COMMANDS.slice(0, 3).map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => executeManualCommand(cmd)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium shrink-0 transition"
                >
                  "{cmd.command}"
                </button>
              ))}
            </div>

            {/* Bottom tools row */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  stopVoiceControl();
                  openTranscriber();
                }}
                className="text-teal-400 hover:text-teal-300 font-bold flex items-center space-x-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dictate text with Gemini Transcribe</span>
              </button>

              <button
                onClick={() => setShowCheatSheet(true)}
                className="text-slate-400 hover:text-white underline font-medium"
              >
                Manage Voice Shortcuts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Voice Shortcuts Manager & Cheat Sheet Modal */}
      {showCheatSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E293B] p-6 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-gray-900 dark:text-white leading-tight">
                    Voice Recognition Hub
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Custom voice shortcuts &amp; spoken commands
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowCheatSheet(false);
                  setIsCreatingShortcut(false);
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Microphone Permission / Error Notice with Actionable Resolution */}
            {recognitionError && (
              <div className="p-3.5 mb-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 space-y-2">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-amber-900 dark:text-amber-200">
                      Speech recognition was not allowed by the browser
                    </p>
                    <p className="text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                      {typeof window !== 'undefined' && window.self !== window.top
                        ? 'The app is running inside an embedded preview iframe. Web browsers block the Speech Recognition API inside iframes for privacy.'
                        : 'Your browser microphone permission is currently blocked or dismissed.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={typeof window !== 'undefined' ? window.location.href : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs"
                  >
                    <span>Open in Dedicated Browser Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setActiveTab('troubleshoot')}
                    className="px-3 py-1.5 rounded-xl bg-amber-200/70 dark:bg-amber-900/60 hover:bg-amber-200 text-amber-900 dark:text-amber-100 font-bold text-xs transition"
                  >
                    Why is this blocked?
                  </button>
                </div>
              </div>
            )}

            {/* Quick Command Simulator / Tester Input (works without microphone) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSimulateCommand();
              }}
              className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-3"
            >
              <Play className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <input
                type="text"
                value={simulationText}
                onChange={(e) => setSimulationText(e.target.value)}
                placeholder='Test a command without speaking (e.g. "My schedule", "Mood check")...'
                className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none font-medium"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
              >
                <span>Run</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </form>

            {/* Segmented Tab Bar */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-3">
              <button
                onClick={() => {
                  setActiveTab('custom');
                  setIsCreatingShortcut(false);
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'custom'
                    ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <span>Custom</span>
                <span className="px-1.5 py-0.2 rounded-full bg-teal-100 dark:bg-teal-900/40 text-[10px]">
                  {customVoiceShortcuts.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('standard');
                  setIsCreatingShortcut(false);
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'standard'
                    ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <span>Standard</span>
                <span className="px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px]">
                  {VOICE_COMMANDS.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('troubleshoot');
                  setIsCreatingShortcut(false);
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  activeTab === 'troubleshoot'
                    ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Mic Help</span>
              </button>
            </div>

            {/* Tab 1: Custom User-Defined Voice Shortcuts */}
            {activeTab === 'custom' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {/* Add New Shortcut Trigger Button */}
                {!isCreatingShortcut && (
                  <button
                    onClick={() => setIsCreatingShortcut(true)}
                    className="w-full p-3 rounded-2xl border-2 border-dashed border-teal-500/50 bg-teal-50/40 dark:bg-teal-950/20 hover:bg-teal-50 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Custom Voice Shortcut</span>
                  </button>
                )}

                {/* Create New Shortcut Inline Form */}
                {isCreatingShortcut && (
                  <form
                    onSubmit={handleSaveCustomShortcut}
                    className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 space-y-3 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-teal-800 dark:text-teal-300 tracking-wider">
                        New Voice Shortcut
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCreatingShortcut(false)}
                        className="text-gray-400 hover:text-gray-600 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Spoken phrase */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        What phrase will you speak?
                      </label>
                      <input
                        type="text"
                        value={newPhrase}
                        onChange={(e) => setNewPhrase(e.target.value)}
                        placeholder="e.g. My Schedule, Mood check, Check on Alex"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                        autoFocus
                        required
                      />
                    </div>

                    {/* Target View Destination */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        Where should it take you?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {TARGET_VIEW_OPTIONS.map((opt) => {
                          const IconComp = opt.icon;
                          const isSel = selectedTarget === opt.id;
                          return (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() => handleSelectTargetView(opt.id)}
                              className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center gap-1.5 transition ${
                                isSel
                                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <IconComp className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Spoken confirmation feedback */}
                    <div>
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                        What should the app speak back?
                      </label>
                      <input
                        type="text"
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        placeholder="e.g. Opening your daily schedule."
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-800 text-xs font-medium text-gray-800 dark:text-gray-200 outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCreatingShortcut(false)}
                        className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Voice Shortcut</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Custom Voice Shortcuts */}
                {filteredCustomShortcuts.map((sc) => {
                  const targetMeta = TARGET_VIEW_OPTIONS.find((o) => o.id === sc.targetView);
                  const IconComp = targetMeta ? targetMeta.icon : Bookmark;

                  return (
                    <div
                      key={sc.id}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 flex items-center justify-between gap-3 group hover:border-teal-500 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-heading font-black text-sm text-gray-900 dark:text-white block truncate">
                            "{sc.phrase}"
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <span>Opens {sc.label}</span>
                            {sc.responseMessage && (
                              <span className="hidden sm:inline italic truncate">
                                • Speaks: "{sc.responseMessage}"
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Test Button */}
                        <button
                          onClick={() => {
                            const matched = matchVoiceCommand(sc.phrase, customVoiceShortcuts);
                            if (matched) executeManualCommand(matched);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-xs font-bold transition"
                        >
                          Test
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteCustomVoiceShortcut(sc.id)}
                          className="p-1.5 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete shortcut"
                          aria-label={`Delete shortcut for ${sc.phrase}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Standard Voice Commands */}
            {activeTab === 'standard' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {/* Search filter for standard commands */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter commands (e.g. schedule, garden, notes, walk, camera)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {filteredStandardCommands.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-400">
                    No commands matched "{searchFilter}".
                  </div>
                ) : (
                  filteredStandardCommands.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={() => executeManualCommand(cmd)}
                      className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-teal-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-gray-800 text-left flex items-center justify-between transition group touch-target"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-heading font-extrabold text-sm text-gray-900 dark:text-white block">
                          "{cmd.command}"
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                          {cmd.description}
                        </span>
                        <span className="text-[10px] text-teal-600/80 dark:text-teal-400/80 font-mono block truncate mt-0.5">
                          Also responds to: {cmd.aliases.slice(0, 4).join(', ')}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        Try
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Microphone Help & Troubleshooting Guide */}
            {activeTab === 'troubleshoot' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-gray-700 dark:text-gray-300">
                <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-sm">
                    <Info className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
                    <span>Why Speech Recognition is Blocked or Not Allowed</span>
                  </div>
                  <p className="leading-relaxed text-teal-900/90 dark:text-teal-200 text-xs">
                    Web browsers protect privacy by placing security restrictions around microphone and speech recognition APIs:
                  </p>
                </div>

                {/* Reason 1: Embedded Iframe */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black">
                        1
                      </span>
                      Embedded Preview Iframe (Most Common)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                      Iframe Security
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs">
                    When running inside an embedded preview or editor iframe, modern browsers restrict Web Speech API access across iframe boundaries. Opening the app in a dedicated tab resolves this immediately.
                  </p>
                  <a
                    href={typeof window !== 'undefined' ? window.location.href : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition"
                  >
                    <span>Open EasyPath in Dedicated Browser Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Reason 2: Browser Site Settings */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black">
                        2
                      </span>
                      Browser Permission Blocked
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Permissions
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs">
                    If microphone access was denied or dismissed:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400 pl-1 text-xs">
                    <li>Look at the address bar at the top of your browser window.</li>
                    <li>Click the <strong>Lock (🔒)</strong> or <strong>Site Settings (Tune)</strong> icon.</li>
                    <li>Change <strong>Microphone</strong> from <em>Block</em> to <strong>Allow</strong>.</li>
                    <li>Reload the page.</li>
                  </ol>
                </div>

                {/* Reason 3: Browser Engine Support */}
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black">
                        3
                      </span>
                      Browser Compatibility
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Engine
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs">
                    Native Web Speech recognition is supported in <strong>Chrome</strong>, <strong>Edge</strong>, and <strong>Safari</strong>. Firefox and Brave (with shields on) do not connect to Google's speech recognition backend by default.
                  </p>
                </div>

                {/* Zero-Barrier Alternatives */}
                <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 space-y-2">
                  <span className="font-bold text-teal-900 dark:text-teal-200 block text-xs">
                    Zero-Barrier Fallbacks (No Mic Needed):
                  </span>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCheatSheet(false);
                        openTranscriber();
                      }}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center gap-2 hover:bg-teal-50 text-xs transition"
                    >
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span>Use Gemini Voice Dictate (Server Audio)</span>
                    </button>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                      You can also use the <strong>Run</strong> input at the top or tap any shortcut button directly to navigate!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setShowCheatSheet(false);
                  startVoiceControl();
                }}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" />
                <span>Start Voice Recognition</span>
              </button>

              <button
                onClick={() => setShowCheatSheet(false)}
                className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
