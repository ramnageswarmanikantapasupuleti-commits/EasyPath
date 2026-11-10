import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Radio,
  Headphones,
} from 'lucide-react';
import { float32To16BitPcmBase64, LiveAudioPlayer } from '../../../utils/audioLiveUtils';

interface LiveVoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TranscriptItem {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
}

export const LiveVoiceConversationModal: React.FC<LiveVoiceConversationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isGeminiSpeaking, setIsGeminiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: 'init-1',
      sender: 'gemini',
      text: 'Hello Alex! I am PathFinder with Gemini 3.8 Live. I can hear you and talk with you in real-time. How are you doing today?',
      timestamp: 'Just now',
    },
  ]);
  const [textInput, setTextInput] = useState('');
  const [micBlocked, setMicBlocked] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll transcript thread
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, isGeminiSpeaking]);

  useEffect(() => {
    if (isOpen) {
      connectToLiveApi();
    } else {
      cleanupLiveSession();
    }
    return () => {
      cleanupLiveSession();
    };
  }, [isOpen]);

  const connectToLiveApi = async () => {
    cleanupLiveSession();
    setConnectionStatus('connecting');
    setErrorMessage(null);
    setMicBlocked(false);

    // Initialize output audio player (24kHz for Gemini Live output)
    audioPlayerRef.current = new LiveAudioPlayer(24000);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/live`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to EasyPath Live WebSocket');
        setConnectionStatus('connected');
        // Start capturing microphone audio
        startMicrophoneCapture();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'ready') {
            setConnectionStatus('connected');
          } else if (data.type === 'audio' && data.audio) {
            setIsGeminiSpeaking(true);
            audioPlayerRef.current?.playChunk(data.audio);
          } else if (data.type === 'text' && data.text) {
            setIsGeminiSpeaking(true);
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'gemini') {
                return [...prev.slice(0, -1), { ...last, text: last.text + ' ' + data.text }];
              } else {
                return [
                  ...prev,
                  {
                    id: `g-${Date.now()}`,
                    sender: 'gemini',
                    text: data.text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ];
              }
            });
          } else if (data.type === 'interrupted') {
            audioPlayerRef.current?.stopAndClear();
            setIsGeminiSpeaking(false);
          } else if (data.type === 'turnComplete') {
            setIsGeminiSpeaking(false);
          } else if (data.type === 'error') {
            console.warn('Live API error message:', data.message);
            setErrorMessage(data.message);
          }
        } catch (err) {
          console.warn('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (e) => {
        console.warn('WebSocket error in Live API:', e);
        setConnectionStatus('error');
        setErrorMessage('Could not connect to Gemini Live audio server.');
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        setIsGeminiSpeaking(false);
      };
    } catch (err: any) {
      console.warn('WebSocket connection error:', err);
      setConnectionStatus('error');
      setErrorMessage(err?.message || 'Failed to initialize live connection.');
    }
  };

  const startMicrophoneCapture = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicBlocked(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      // ScriptProcessor with buffer size 4096 (approx 256ms chunk at 16kHz)
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (isMicMuted) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);

        // Simple volume threshold check to detect user speaking
        let sum = 0;
        for (let i = 0; i < inputChannelData.length; i++) {
          sum += Math.abs(inputChannelData[i]);
        }
        const avg = sum / inputChannelData.length;
        setIsUserSpeaking(avg > 0.03);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64Pcm = float32To16BitPcmBase64(inputChannelData);
          wsRef.current.send(
            JSON.stringify({
              type: 'audio',
              audio: base64Pcm,
            })
          );
        }
      };
    } catch (micErr: any) {
      console.warn('Microphone capture error for Live API:', micErr);
      setMicBlocked(true);
      setErrorMessage('Microphone access was blocked or not granted in this browser view.');
    }
  };

  const cleanupLiveSession = () => {
    // Stop mic stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    // Close input audio context
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }
    // Disconnect script processor
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {}
      scriptProcessorRef.current = null;
    }
    // Close audio player
    if (audioPlayerRef.current) {
      audioPlayerRef.current.close();
      audioPlayerRef.current = null;
    }
    // Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
    setIsGeminiSpeaking(false);
    setIsUserSpeaking(false);
  };

  const handleSendTextMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;

    const query = textInput.trim();
    setTextInput('');

    // Add to transcript
    setTranscripts((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Send to Live WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: query,
        })
      );
    } else {
      // Fallback response if offline
      setTimeout(() => {
        setTranscripts((prev) => [
          ...prev,
          {
            id: `g-${Date.now()}`,
            sender: 'gemini',
            text: `I heard: "${query}". I am here with you. Take things one calm step at a time!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 500);
    }
  };

  const toggleMic = () => {
    setIsMicMuted((prev) => !prev);
  };

  const handleInterruptGemini = () => {
    audioPlayerRef.current?.stopAndClear();
    setIsGeminiSpeaking(false);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text: 'stop' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-xl h-[92vh] max-h-[720px] rounded-3xl bg-slate-900 text-white border-2 border-teal-500/50 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center relative">
              <Headphones className="w-5 h-5" />
              {connectionStatus === 'connected' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base text-white">Live Voice Conversation</h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-900/60 text-teal-300 text-[10px] font-mono font-bold border border-teal-500/40">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {connectionStatus === 'connecting'
                  ? 'Connecting to real-time audio session...'
                  : connectionStatus === 'connected'
                  ? 'Real-time two-way voice active'
                  : 'Disconnected'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition touch-target"
            aria-label="Close voice conversation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Audio Reactive Visualization Orb */}
        <div className="py-6 px-4 bg-gradient-to-b from-slate-950/60 via-slate-900 to-slate-950/40 flex flex-col items-center justify-center shrink-0 border-b border-slate-800/80">
          <div className="relative flex items-center justify-center">
            {/* Glowing ripple halos */}
            <div
              className={`absolute w-36 h-36 rounded-full transition-all duration-300 ${
                isGeminiSpeaking
                  ? 'bg-teal-500/20 scale-125 animate-ping'
                  : isUserSpeaking
                  ? 'bg-rose-500/20 scale-110 animate-ping'
                  : 'bg-teal-500/10'
              }`}
            />
            <div
              className={`absolute w-28 h-28 rounded-full blur-md transition-all duration-300 ${
                isGeminiSpeaking
                  ? 'bg-teal-400/30 scale-110'
                  : isUserSpeaking
                  ? 'bg-rose-400/30 scale-110'
                  : 'bg-teal-500/20'
              }`}
            />

            {/* Central Orb */}
            <div
              className={`w-20 h-20 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
                isGeminiSpeaking
                  ? 'bg-gradient-to-tr from-teal-500 to-emerald-400 scale-105 shadow-teal-500/40 ring-4 ring-teal-400/30'
                  : isUserSpeaking
                  ? 'bg-gradient-to-tr from-rose-500 to-amber-500 scale-105 shadow-rose-500/40 ring-4 ring-rose-400/30'
                  : 'bg-gradient-to-tr from-slate-700 to-teal-800 shadow-slate-900/60'
              }`}
            >
              {isGeminiSpeaking ? (
                <Radio className="w-9 h-9 text-white animate-pulse" />
              ) : isUserSpeaking ? (
                <Mic className="w-9 h-9 text-white animate-bounce" />
              ) : (
                <Sparkles className="w-9 h-9 text-teal-200" />
              )}
            </div>
          </div>

          <div className="mt-3 text-center">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                isGeminiSpeaking
                  ? 'bg-teal-900/60 text-teal-200 border border-teal-500/40'
                  : isUserSpeaking
                  ? 'bg-rose-900/60 text-rose-200 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {isGeminiSpeaking
                ? 'Gemini 3.8 Live is speaking...'
                : isUserSpeaking
                ? 'Listening to you speak...'
                : isMicMuted
                ? 'Microphone is muted'
                : 'Listening... speak anytime'}
            </span>
          </div>

          {/* Microphone permission notice banner if blocked in iframe */}
          {micBlocked && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs flex items-center justify-between gap-2 max-w-md">
              <span>Microphone blocked in iframe preview. You can speak by opening in a dedicated tab or type below:</span>
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shrink-0 flex items-center gap-1 text-[11px]"
              >
                <span>Full Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Live Conversation Transcript Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-2">
          {transcripts.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col ${t.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5 px-1 font-semibold">
                <span>{t.sender === 'user' ? 'You' : 'PathFinder (Gemini Live)'}</span>
                <span>• {t.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                  t.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-br-xs font-medium'
                    : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700/80'
                }`}
              >
                {t.text}
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>

        {/* Quick Conversation Starter Chips */}
        <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0">Ask:</span>
          {[
            'How can I calm down right now?',
            'What is on my schedule today?',
            'Can we practice talking?',
            'Help me with my steps',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setTextInput(prompt);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 text-xs font-medium transition"
            >
              "{prompt}"
            </button>
          ))}
        </div>

        {/* Controls Bar & Direct Text Input for Accessibility */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
          <form onSubmit={handleSendTextMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type into the live voice conversation..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="p-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-bold transition shrink-0"
              aria-label="Send message to live conversation"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Action buttons row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMic}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  isMicMuted
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-teal-400" />}
                <span>{isMicMuted ? 'Mic Muted' : 'Mic Active'}</span>
              </button>

              {isGeminiSpeaking && (
                <button
                  type="button"
                  onClick={handleInterruptGemini}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-900/60 border border-amber-600/40 text-amber-200 text-xs font-bold hover:bg-amber-800 transition"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Interrupt</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={connectToLiveApi}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white transition"
                title="Reconnect Live Session"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
