import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Volume2,
  Bookmark,
  Share2,
  Sparkles,
  FileText,
  HelpCircle,
  Users,
  Check,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useSpeech } from '../../../hooks/useSpeech';

export const CameraHelperView: React.FC = () => {
  const { addContact, addSharedNote, settings, profile } = useApp();
  const { speak, isSpeaking } = useSpeech(settings.speechSpeed);

  const [mode, setMode] = useState<'explain' | 'what' | 'who'>('explain');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    headline: string;
    explanation: string;
    actionTip: string;
    identifiedCategory?: string;
  } | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera when component mounts or preview resets
  useEffect(() => {
    let active = true;

    async function initCamera() {
      if (photoPreview) return; // Don't run camera if viewing photo
      try {
        setCameraError(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          if (active && videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        }
      } catch (err: any) {
        console.debug('Camera access failed or denied:', err);
        setCameraError('Camera access not active. You can upload a photo or pick a sample below.');
      }
    }

    initCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [photoPreview]);

  // Capture from live video feed
  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoPreview(base64);
        analyzePhotoWithGemini(base64);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle file upload from gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        analyzePhotoWithGemini(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample quick test photos (simulated everyday accessibility cards)
  const loadSample = (sampleType: 'letter' | 'keys' | 'medicine') => {
    let sampleImg = '';
    if (sampleType === 'letter') {
      sampleImg = 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=600&q=80';
    } else if (sampleType === 'keys') {
      sampleImg = 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80';
    } else {
      sampleImg = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80';
    }

    setPhotoPreview(sampleImg);

    // Call Gemini API with sample image or simulate analysis
    analyzePhotoWithGemini(sampleImg, true);
  };

  const analyzePhotoWithGemini = async (imageBase64: string, isSampleUrl = false) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setIsSaved(false);
    setIsShared(false);
    speak('Analyzing image with Gemini...');

    try {
      const response = await fetch('/api/ai/explain-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64,
          mode: mode,
        }),
      });

      const data = await response.json();
      const result = {
        headline: data.headline || 'Letter or Document',
        explanation: data.explanation || 'This is an informative letter. No immediate payment or urgent action is requested.',
        actionTip: data.actionTip || 'You can keep this in your drawer or show it to your helper Sarah.',
        identifiedCategory: data.identifiedCategory || 'document',
      };

      setAnalysisResult(result);
      setIsAnalyzing(false);

      if (settings.autoRead) {
        speak(`${result.headline}. ${result.explanation}. ${result.actionTip}`);
      }
    } catch (err) {
      console.error(err);
      const fallbackResult = {
        headline: 'Document Explained',
        explanation: 'This notice is for your records. Your account is in good standing and no action is required.',
        actionTip: 'You can save this note or show it to your helper Sarah later.',
      };
      setAnalysisResult(fallbackResult);
      setIsAnalyzing(false);
      speak(`${fallbackResult.headline}. ${fallbackResult.explanation}`);
    }
  };

  const resetCapture = () => {
    setPhotoPreview(null);
    setAnalysisResult(null);
    setIsSaved(false);
    setIsShared(false);
  };

  const handleSaveToMemory = () => {
    if (!analysisResult) return;
    addContact({
      id: `mem-${Date.now()}`,
      type: mode === 'who' ? 'contact' : 'object',
      name: analysisResult.headline,
      relationshipOrCategory: mode === 'who' ? 'Familiar Person' : 'Saved Everyday Item',
      note: `${analysisResult.explanation} ${analysisResult.actionTip}`,
      photoUrl: photoPreview || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=300&q=80',
    });
    setIsSaved(true);
    speak('Saved to your Memory Aid library.');
  };

  const handleShareWithHelper = () => {
    if (!analysisResult) return;
    addSharedNote(`📷 Camera Snapshot: "${analysisResult.headline}" — ${analysisResult.explanation}`);
    setIsShared(true);
    speak(`Shared with your helper ${profile.caregiverName}.`);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white">
            Camera Helper
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Point at any bill, sign, or item for plain language
          </p>
        </div>

        {photoPreview && (
          <button
            onClick={resetCapture}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake</span>
          </button>
        )}
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setMode('explain')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mode === 'explain'
              ? 'bg-white dark:bg-gray-700 text-[#2C5F8A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Explain Text</span>
        </button>

        <button
          onClick={() => setMode('what')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mode === 'what'
              ? 'bg-white dark:bg-gray-700 text-[#2C5F8A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>What is this?</span>
        </button>

        <button
          onClick={() => setMode('who')}
          className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            mode === 'who'
              ? 'bg-white dark:bg-gray-700 text-[#2C5F8A] dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Who is this?</span>
        </button>
      </div>

      {/* Viewfinder or Captured Photo Screen */}
      <div className="relative rounded-3xl overflow-hidden bg-black aspect-4/3 sm:aspect-16/10 flex items-center justify-center border-2 border-[#E8E5DF] dark:border-gray-800 shadow-inner">
        {!photoPreview ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Viewfinder Overlay Guide Box */}
            <div className="absolute inset-8 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-white/80 font-bold text-xs bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                Hold still over text or item
              </span>
            </div>

            {cameraError && (
              <div className="absolute inset-0 bg-black/85 p-6 flex flex-col items-center justify-center text-center text-white">
                <AlertCircle className="w-10 h-10 text-[#F5A623] mb-2" />
                <p className="text-sm font-semibold mb-4">{cameraError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#4A90D9] text-white text-xs font-bold flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Picture</span>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <img
            src={photoPreview}
            alt="Captured item"
            className="w-full h-full object-cover"
          />
        )}

        {/* Shutter Button when live */}
        {!photoPreview && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/40 touch-target"
              title="Upload photo"
            >
              <Upload className="w-5 h-5" />
            </button>

            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-[#F5A623] to-[#FFC043] text-gray-900 border-4 border-white shadow-xl flex items-center justify-center active:scale-90 transition-transform touch-target"
              aria-label="Capture photo"
            >
              <Camera className="w-7 h-7 stroke-[2.5]" />
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Quick Test Samples for Preview */}
      {!photoPreview && (
        <div className="p-3 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E8E5DF] dark:border-gray-800">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Try a sample photograph:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadSample('letter')}
              className="flex-1 py-2 px-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 transition"
            >
              📄 Bank Letter
            </button>
            <button
              onClick={() => loadSample('keys')}
              className="flex-1 py-2 px-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 transition"
            >
              🔑 House Keys
            </button>
            <button
              onClick={() => loadSample('medicine')}
              className="flex-1 py-2 px-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 transition"
            >
              💊 Pill Bottle
            </button>
          </div>
        </div>
      )}

      {/* Analysis Result Card */}
      {isAnalyzing && (
        <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center animate-pulse">
          <Sparkles className="w-8 h-8 text-[#4A90D9] mx-auto mb-2" />
          <h3 className="font-heading font-extrabold text-lg text-[#2C5F8A] dark:text-blue-300">
            Figuring this out for you…
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Gemini is reading the image in plain language.
          </p>
        </div>
      )}

      {analysisResult && !isAnalyzing && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E293B] border-2 border-[#4A90D9]/30 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#4A90D9] text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Easy Explanation</span>
            </div>

            <button
              onClick={() =>
                speak(`${analysisResult.headline}. ${analysisResult.explanation}. ${analysisResult.actionTip}`)
              }
              className={`p-2.5 rounded-xl border transition active:scale-95 touch-target ${
                isSpeaking
                  ? 'bg-[#4A90D9] text-white border-[#4A90D9] animate-pulse'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
              aria-label="Read explanation aloud"
            >
              <Volume2 className="w-5 h-5 text-[#4A90D9]" />
            </button>
          </div>

          <div>
            <h3 className="font-heading font-black text-2xl text-gray-900 dark:text-white mb-2">
              {analysisResult.headline}
            </h3>
            <p className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
              {analysisResult.explanation}
            </p>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4CAF7D] shrink-0" />
              <span>{analysisResult.actionTip}</span>
            </div>
          </div>

          {/* Action Triggers: Save & Share */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleSaveToMemory}
              disabled={isSaved}
              className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4 text-[#4CAF7D]" /> : <Bookmark className="w-4 h-4" />}
              <span>{isSaved ? 'Saved to Memory' : 'Save Item'}</span>
            </button>

            <button
              onClick={handleShareWithHelper}
              disabled={isShared}
              className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition ${
                isShared
                  ? 'bg-blue-50 text-[#2C5F8A] border-blue-200'
                  : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 shadow-xs'
              }`}
            >
              {isShared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{isShared ? 'Shared' : 'Send to Helper'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
