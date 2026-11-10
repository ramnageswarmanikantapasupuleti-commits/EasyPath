import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Sparkles, X, Check, Volume2, AlertCircle, RefreshCw } from 'lucide-react';

interface AudioTranscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTranscription: (text: string) => void;
  title?: string;
  hintText?: string;
}

export const AudioTranscriberModal: React.FC<AudioTranscriberModalProps> = ({
  isOpen,
  onClose,
  onApplyTranscription,
  title = 'Voice Dictation with Gemini',
  hintText = 'Speak clearly into your microphone. Gemini 3.5 Transcribe will turn your voice into plain, clear text.',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setTranscribedText('');
      setErrorMessage(null);
      setRecordingSeconds(0);
    }
  }, [isOpen]);

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscribedText('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all audio tracks to free microphone
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await handleSendAudioToGemini(audioBlob, mimeType);
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission or hardware error:', err);
      setErrorMessage(
        'Could not access microphone. Please check your browser microphone permission or type your text directly.'
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSendAudioToGemini = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch('/api/ai/transcribe-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64Data, mimeType }),
          });

          const data = await res.json();
          if (data.transcription) {
            setTranscribedText(data.transcription);
          } else if (data.fallback) {
            setTranscribedText(data.fallback);
          } else {
            throw new Error(data.error || 'Failed to transcribe');
          }
        } catch (postErr: any) {
          console.warn('Backend audio transcription fallback:', postErr);
          setErrorMessage('Could not complete audio transcription. Please try speaking again.');
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (err: any) {
      console.error('Audio conversion error:', err);
      setIsTranscribing(false);
      setErrorMessage('Could not process audio format.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border-2 border-teal-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini 3.5 Transcribe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close voice transcriber"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guidance Note */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-teal-50/60 dark:bg-teal-950/30 p-3.5 rounded-2xl border border-teal-100 dark:border-teal-900/40">
          {hintText}
        </p>

        {/* Recording Visualizer Area */}
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
          <div className="relative">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              aria-label={isRecording ? 'Stop recording voice' : 'Start recording voice'}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 shadow-xl ${
                isRecording
                  ? 'bg-rose-500 ring-8 ring-rose-200 dark:ring-rose-900/50'
                  : 'bg-teal-600 hover:bg-teal-500'
              }`}
            >
              {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <div className="text-center">
            {isRecording ? (
              <div className="space-y-1">
                <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                  Listening... {recordingSeconds}s
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tap square when finished speaking</p>
              </div>
            ) : isTranscribing ? (
              <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm font-semibold">Gemini is transcribing your voice...</span>
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Tap microphone to begin speaking
              </p>
            )}
          </div>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-center space-x-2 text-rose-700 dark:text-rose-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Transcription Output Review */}
        {transcribedText && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Transcribed Result:
            </label>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-base">
              "{transcribedText}"
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          {transcribedText && (
            <button
              onClick={() => {
                onApplyTranscription(transcribedText);
                onClose();
              }}
              className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md flex items-center space-x-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Use This Text</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
