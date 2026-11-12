import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Bot,
  User,
  Volume2,
  Trash2,
  Zap,
  Brain,
  Shield,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Radio,
  Clock,
  Layers,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech, playGentleChime } from '../../../hooks/useSpeech';
import { ChatMessage, ChatModelOption, ChatPersonaOption } from '../../../types';

const PERSONA_CONFIGS: Record<
  ChatPersonaOption,
  {
    label: string;
    description: string;
    badge: string;
    icon: string;
    starterPrompts: string[];
    defaultGreeting: string;
  }
> = {
  compassionate_guide: {
    label: 'Compassionate Guide',
    description: 'Warm, patient, and gentle everyday cognitive companion.',
    badge: 'Friendly & Calming',
    icon: '🌸',
    starterPrompts: [
      'I am feeling a little stressed today, can we talk?',
      'Can you help me plan what to do this afternoon?',
      'Give me a gentle positive reminder for today.',
      'What are some simple ways to relax my mind?',
    ],
    defaultGreeting:
      'Hello Alex! I am your compassionate guide. Take a calm breath. What is on your mind today?',
  },
  memory_coach: {
    label: 'Memory & Routine Coach',
    description: 'Organize your thoughts, find misplaced items, and manage routines.',
    badge: 'Structure & Memory',
    icon: '📋',
    starterPrompts: [
      'Where are the best places to look for my keys?',
      'Help me create an easy 3-step morning checklist.',
      'How can I remember to take my 4:00 PM tea and walk?',
      'I forgot what I was about to do just now.',
    ],
    defaultGreeting:
      'Hi there! I am your Memory Coach. Tell me what you need to remember or find, and we will take it step by step.',
  },
  plain_language: {
    label: 'Plain Language Explainer',
    description: 'Transform confusing letters, bills, and medical notices into simple words.',
    badge: 'Clear & Simple',
    icon: '📄',
    starterPrompts: [
      'Explain what a utility bill balance forward means.',
      'How does a referral to a physical therapist work?',
      'What should I bring to an annual doctor checkup?',
      'Summarize what an insurance co-pay is in simple words.',
    ],
    defaultGreeting:
      'Welcome! Paste or type any confusing letter or notice, and I will explain it in clear, stress-free language.',
  },
  caregiver_advisor: {
    label: 'Caregiver Advisor',
    description: 'Support, burnout relief, and routine strategies for caregivers.',
    badge: 'Caregiver Support',
    icon: '🤝',
    starterPrompts: [
      'How can I de-escalate anxiety when my loved one resists their routine?',
      'Quick 5-minute self-care tips for caregiver fatigue.',
      'How to gently redirect repetitive questions without frustration?',
      'Adapting daily tasks as cognitive abilities fluctuate.',
    ],
    defaultGreeting:
      'Welcome Sarah. Caregiving is meaningful but deeply demanding. I am here with evidence-based tips and calm support.',
  },
};

const MODEL_CONFIGS: Record<
  ChatModelOption,
  {
    name: string;
    modelId: string;
    tag: string;
    speed: string;
    bestFor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  'gemini-3.8-flash': {
    name: 'Balanced',
    modelId: 'gemini-3.8-flash',
    tag: 'Recommended',
    speed: 'Fast & Empathetic',
    bestFor: 'General everyday conversation & cognitive guidance',
    icon: Sparkles,
  },
  'gemini-3.1-flash-lite': {
    name: 'Fast',
    modelId: 'gemini-3.1-flash-lite',
    tag: 'Ultra Fast',
    speed: 'Instant',
    bestFor: 'Rapid one-sentence answers and quick tips',
    icon: Zap,
  },
  'gemini-4-argon': {
    name: 'Deep Reasoning',
    modelId: 'gemini-4-argon',
    tag: 'Complex Tasks',
    speed: 'High Depth',
    bestFor: 'Complex multi-step planning, analysis, and detailed problem-solving',
    icon: Brain,
  },
};

export const ChatbotView: React.FC = () => {
  const { settings, openTranscriber, setIsLiveVoiceOpen } = useApp();
  const { speak } = useSpeech(settings.speechSpeed);

  const [selectedPersona, setSelectedPersona] = useState<ChatPersonaOption>('compassionate_guide');
  const [selectedModel, setSelectedModel] = useState<ChatModelOption>('gemini-3.8-flash');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('easypath_gemini_chat_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'msg-init',
        role: 'model',
        text: PERSONA_CONFIGS.compassionate_guide.defaultGreeting,
        timestamp: 'Just now',
        modelUsed: 'gemini-3.8-flash',
        personaUsed: 'compassionate_guide',
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const threadEndRef = useRef<HTMLDivElement | null>(null);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('easypath_gemini_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setInputText('');
    setIsLoading(true);
    playGentleChime('chime');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread.slice(-10).map((m) => ({
            role: m.role === 'model' ? 'model' : 'user',
            text: m.text,
          })),
          model: selectedModel,
          rolePersona: selectedPersona,
        }),
      });

      const data = await res.json();
      const botReply = data.reply || 'I am right here with you. How can I help next?';

      const botMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModel,
        personaUsed: selectedPersona,
      };

      setMessages((prev) => [...prev, botMsg]);
      playGentleChime('success');

      // Auto-read response if speech auto-read is enabled
      if (settings.autoRead) {
        speak(botReply);
      }
    } catch (err: any) {
      console.warn('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: 'I am here with you. Take a gentle breath. We can take this step by step. What would you like to do next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
        personaUsed: selectedPersona,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const initial: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'model',
      text: PERSONA_CONFIGS[selectedPersona].defaultGreeting,
      timestamp: 'Just now',
      modelUsed: selectedModel,
      personaUsed: selectedPersona,
    };
    setMessages([initial]);
    localStorage.removeItem('easypath_gemini_chat_history');
    playGentleChime('chime');
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentPersonaMeta = PERSONA_CONFIGS[selectedPersona];

  return (
    <div className="space-y-4 animate-in fade-in pb-12">
      {/* 1. Header Card with Persona & Model Configuration */}
      <div className="card-warm p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl shadow-xs">
              {currentPersonaMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                  PathFinder Chat
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-[10px] font-bold">
                  {currentPersonaMeta.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-turn conversation with memory and customized roles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Real-time Voice Call Button */}
            <button
              onClick={() => setIsLiveVoiceOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition"
              title="Start real-time voice conversation with Gemini 3.8 Live"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live Voice (gemini-3.8-live)</span>
            </button>

            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Clear conversation history"
              aria-label="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona & Model Selection Row */}
        <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Persona selector */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Assistant Persona:
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(PERSONA_CONFIGS) as ChatPersonaOption[]).map((key) => {
                const p = PERSONA_CONFIGS[key];
                const isSel = selectedPersona === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedPersona(key);
                      // Add greeting if chat is fresh
                      if (messages.length <= 1) {
                        setMessages([
                          {
                            id: `init-${key}`,
                            role: 'model',
                            text: p.defaultGreeting,
                            timestamp: 'Just now',
                            modelUsed: selectedModel,
                            personaUsed: key,
                          },
                        ]);
                      }
                    }}
                    className={`p-2 rounded-xl text-left border text-xs transition flex items-center gap-1.5 ${
                      isSel
                        ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-800 dark:text-teal-200 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span className="truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model selector */}
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Gemini Model Mode:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(MODEL_CONFIGS) as ChatModelOption[]).map((key) => {
                const m = MODEL_CONFIGS[key];
                const IconComp = m.icon;
                const isSel = selectedModel === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedModel(key)}
                    className={`p-2 rounded-xl text-left border transition flex flex-col justify-between ${
                      isSel
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                    title={`${m.modelId} — ${m.bestFor}`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <IconComp className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold truncate">{m.name}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono truncate ${
                        isSel ? 'text-teal-100' : 'text-slate-400'
                      }`}
                    >
                      {m.modelId}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Multi-Turn Message Thread */}
      <div className="card-warm p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md min-h-[380px] max-h-[520px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 no-scrollbar">
          {messages.map((msg) => {
            const isModel = msg.role === 'model';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isModel ? 'items-start' : 'items-end'} animate-in fade-in`}
              >
                {/* Message Header */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1 font-semibold">
                  {isModel ? (
                    <>
                      <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span className="font-bold text-teal-700 dark:text-teal-300">
                        {currentPersonaMeta.label}
                      </span>
                      {msg.modelUsed && (
                        <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[9px] text-slate-500">
                          {msg.modelUsed}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">You</span>
                    </>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-sm leading-relaxed relative group ${
                    isModel
                      ? 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700/80'
                      : 'bg-teal-600 text-white rounded-br-xs shadow-sm font-medium'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Actions for Assistant Bubble */}
                  {isModel && (
                    <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <button
                        onClick={() => speak(msg.text)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-slate-700 font-bold transition"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Read Aloud</span>
                      </button>

                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[11px] text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking / Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 max-w-sm text-xs text-teal-700 dark:text-teal-300 font-bold animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-teal-500" />
              <span>
                {selectedModel === 'gemini-4-argon'
                  ? 'Gemini 4 Argon is reasoning with deep thinking...'
                  : `${selectedModel} is thinking...`}
              </span>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Suggested Starter Prompts */}
        <div className="pt-2.5 pb-1 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Try:</span>
          {currentPersonaMeta.starterPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-teal-700 text-xs shrink-0 transition"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Input Bar with Voice Dictation */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${currentPersonaMeta.label}...`}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isLoading}
          />

          {/* Voice Dictation Button */}
          <button
            type="button"
            onClick={() => {
              openTranscriber((transcript) => {
                setInputText(transcript);
              });
            }}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 text-slate-600 dark:text-slate-300 hover:text-teal-600 border border-slate-200 dark:border-slate-700 transition"
            title="Dictate message with voice"
            aria-label="Dictate text"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-bold text-sm shadow-md transition flex items-center gap-1"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
