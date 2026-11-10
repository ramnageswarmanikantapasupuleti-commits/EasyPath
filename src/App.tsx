import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopRoleBar } from './components/layout/TopRoleBar';
import { BottomNav } from './components/layout/BottomNav';

// User Mode Views
import { HomeDashboard } from './components/views/user/HomeDashboard';
import { TaskListView } from './components/views/user/TaskListView';
import { TaskStepRunner } from './components/views/user/TaskStepRunner';
import { DailyScheduleView } from './components/views/user/DailyScheduleView';
import { CameraHelperView } from './components/views/user/CameraHelperView';
import { MemoryAidView } from './components/views/user/MemoryAidView';
import { SafeNavigationView } from './components/views/user/SafeNavigationView';
import { MoodCheckInView } from './components/views/user/MoodCheckInView';
import { LifeSkillsView } from './components/views/user/LifeSkillsView';
import { RewardsView } from './components/views/user/RewardsView';
import { TextSimplifierView } from './components/views/user/TextSimplifierView';
import { ProfileView } from './components/views/user/ProfileView';
import { SettingsView } from './components/views/user/SettingsView';
import { HelpSupportView } from './components/views/user/HelpSupportView';

// Caregiver Mode Views
import { CaregiverDashboardView } from './components/views/caregiver/CaregiverDashboardView';
import { CaregiverScheduleManager } from './components/views/caregiver/CaregiverScheduleManager';
import { CaregiverTaskManager } from './components/views/caregiver/CaregiverTaskManager';
import { CaregiverProgressView } from './components/views/caregiver/CaregiverProgressView';
import { CaregiverSharedNotesView } from './components/views/caregiver/CaregiverSharedNotesView';

// Global Accessibility Modals
import { AdaptiveHelpModal } from './components/modals/AdaptiveHelpModal';
import { CalmingBreathingModal } from './components/modals/CalmingBreathingModal';
import { LostEmergencyModal } from './components/modals/LostEmergencyModal';
import { GlobalVoiceCommander } from './components/common/GlobalVoiceCommander';
import { CalmingSanctuary3D } from './components/3d/CalmingSanctuary3D';
import { AudioTranscriberModal } from './components/common/AudioTranscriberModal';
import { VideoGuideModal } from './components/common/VideoGuideModal';
import { ChatbotView } from './components/views/user/ChatbotView';
import { LiveVoiceConversationModal } from './components/views/user/LiveVoiceConversationModal';

import { useOnlineStatus } from './hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    role,
    activeView,
    setActiveView,
    caregiverView,
    isSanctuaryOpen,
    setIsSanctuaryOpen,
    isTranscriberOpen,
    setIsTranscriberOpen,
    transcriptionCallback,
    isVideoGuideOpen,
    setIsVideoGuideOpen,
    videoGuidePrompt,
    isLiveVoiceOpen,
    setIsLiveVoiceOpen,
    addTask,
    addSharedNote,
  } = useApp();
  const isOnline = useOnlineStatus();

  const handleApplyTranscription = (text: string) => {
    if (transcriptionCallback) {
      transcriptionCallback(text);
      return;
    }
    // Default smart action: create a quick voice note or task
    if (role === 'caregiver') {
      addSharedNote(text);
    } else {
      addTask({
        id: `task-voice-${Date.now()}`,
        title: text,
        category: 'routine',
        estimatedMinutes: 5,
        status: 'pending',
        isAiGenerated: true,
        steps: [
          {
            id: `s-${Date.now()}-1`,
            stepNumber: 1,
            instruction: text,
            icon: 'Sparkles',
          },
          {
            id: `s-${Date.now()}-2`,
            stepNumber: 2,
            instruction: 'Tap green checkmark when complete',
            icon: 'CheckCircle',
          },
        ],
      });
    }
  };

  const renderUserView = () => {
    switch (activeView) {
      case 'sanctuary':
        return <CalmingSanctuary3D onClose={() => setActiveView('home')} />;
      case 'task_runner':
        return <TaskStepRunner />;
      case 'schedule':
        return <DailyScheduleView />;
      case 'tasks':
        return <TaskListView />;
      case 'camera_helper':
        return <CameraHelperView />;
      case 'memory_aid':
        return <MemoryAidView />;
      case 'navigation':
        return <SafeNavigationView />;
      case 'mood':
        return <MoodCheckInView />;
      case 'life_skills':
        return <LifeSkillsView />;
      case 'rewards':
        return <RewardsView />;
      case 'simplify':
        return <TextSimplifierView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpSupportView />;
      case 'chat':
        return <ChatbotView />;
      case 'home':
      default:
        return <HomeDashboard />;
    }
  };

  const renderCaregiverView = () => {
    switch (caregiverView) {
      case 'schedule':
        return <CaregiverScheduleManager />;
      case 'tasks':
        return <CaregiverTaskManager />;
      case 'progress':
        return <CaregiverProgressView />;
      case 'notes':
        return <CaregiverSharedNotesView />;
      case 'dashboard':
      default:
        return <CaregiverDashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-main)] flex flex-col font-sans transition-colors selection:bg-[#4A90D9]/20 selection:text-[#2C5F8A]">
      {/* Top Application Bar */}
      <TopRoleBar />

      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" />
          <span>Offline Mode — All your saved tasks, reminders, and contacts remain accessible!</span>
        </div>
      )}

      {/* Main Responsive Viewport Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-4 sm:py-6">
        {role === 'user' ? renderUserView() : renderCaregiverView()}
      </main>

      {/* Persistent Bottom Thumb Navigation Bar */}
      <BottomNav />

      {/* Global Overlays & Safety Modals */}
      <AdaptiveHelpModal />
      <CalmingBreathingModal />
      <LostEmergencyModal />
      <GlobalVoiceCommander />

      {/* Fullscreen 3D Calming Sanctuary Overlay */}
      {isSanctuaryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
          <CalmingSanctuary3D onClose={() => setIsSanctuaryOpen(false)} />
        </div>
      )}

      {/* Audio Transcriber Modal (Powered by Gemini 3.5 Transcribe) */}
      <AudioTranscriberModal
        isOpen={isTranscriberOpen}
        onClose={() => setIsTranscriberOpen(false)}
        onApplyTranscription={handleApplyTranscription}
      />

      {/* AI Video Step Guide Modal (Powered by Gemini Omni Flash Video) */}
      <VideoGuideModal
        isOpen={isVideoGuideOpen}
        onClose={() => setIsVideoGuideOpen(false)}
        initialPrompt={videoGuidePrompt}
      />

      {/* Live Voice Conversation Modal (Powered by Gemini 3.8 Live) */}
      <LiveVoiceConversationModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
