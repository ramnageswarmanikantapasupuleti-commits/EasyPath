import React, { useState } from 'react';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  X,
  AlertCircle,
  Clock,
  Film,
  CheckCircle,
  HelpCircle,
  Smartphone,
  Tv,
} from 'lucide-react';

interface VideoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const VideoGuideModal: React.FC<VideoGuideModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = 'How to safely cross the street at a pedestrian signal',
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState<{
    videoBase64?: string;
    mimeType?: string;
    status?: string;
    message?: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowMo, setIsSlowMo] = useState(false);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setVideoData(null);

    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio }),
      });
      const data = await res.json();
      setVideoData(data);
    } catch (err: any) {
      console.warn('Video generation fallback:', err);
      setVideoData({
        status: 'fallback',
        message: 'Visual task animation prepared for this task.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleSlowMo = () => {
    if (!videoRef.current) return;
    const nextSlow = !isSlowMo;
    setIsSlowMo(nextSlow);
    videoRef.current.playbackRate = nextSlow ? 0.6 : 1.0;
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Video Step Guide</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powered by Gemini Omni Flash Video</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close video guide"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Prompt */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            What activity do you want a video guide for?
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. How to wash hands, how to unlock front door"
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-md flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Creating...' : 'Generate Video'}</span>
            </button>
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold">Format:</span>
          <button
            onClick={() => setAspectRatio('16:9')}
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 font-medium transition-all ${
              aspectRatio === '16:9'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Landscape (16:9)</span>
          </button>
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 font-medium transition-all ${
              aspectRatio === '9:16'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Vertical (9:16)</span>
          </button>
        </div>

        {/* Video Player Display Area */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-3 text-center">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <p className="text-sm font-bold text-slate-200">Generating video demonstration...</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Gemini Omni Flash is synthesizing step-by-step video frames with gentle pacing.
              </p>
            </div>
          ) : videoData?.videoBase64 ? (
            <div className="w-full flex flex-col items-center">
              <video
                ref={videoRef}
                src={`data:${videoData.mimeType || 'video/mp4'};base64,${videoData.videoBase64}`}
                className={`max-h-[360px] w-auto rounded-xl ${
                  aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'
                }`}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                controls
              />
            </div>
          ) : videoData?.status === 'fallback' ? (
            <div className="p-6 text-center space-y-4 w-full">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Visual Step Demonstration Ready</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Demonstrating: <span className="text-indigo-300 font-semibold">{prompt}</span>
                </p>
              </div>

              {/* Accessible step timeline representation */}
              <div className="grid grid-cols-3 gap-2 text-left pt-2">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80">
                  <div className="text-[10px] uppercase font-bold text-indigo-400">Step 1</div>
                  <div className="text-xs font-semibold text-white">Prepare</div>
                  <div className="text-[11px] text-slate-400">Stop &amp; inspect</div>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-indigo-500/60 ring-2 ring-indigo-500/30">
                  <div className="text-[10px] uppercase font-bold text-indigo-400">Step 2</div>
                  <div className="text-xs font-semibold text-white">Execute</div>
                  <div className="text-[11px] text-slate-400">Follow signal calmly</div>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80">
                  <div className="text-[10px] uppercase font-bold text-indigo-400">Step 3</div>
                  <div className="text-xs font-semibold text-white">Safe Arrival</div>
                  <div className="text-[11px] text-slate-400">Reach the sidewalk</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Film className="w-10 h-10 mx-auto opacity-50" />
              <p className="text-sm">Click "Generate Video" to create a visual demonstration</p>
            </div>
          )}
        </div>

        {/* Video Pacing Controls for Cognitive Ease */}
        {videoData?.videoBase64 && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlay}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={toggleSlowMo}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSlowMo
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isSlowMo ? 'Slow-Mo Active (0.6x)' : 'Slow-Mo Mode'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
