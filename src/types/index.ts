export type UserRole = 'user' | 'caregiver';

export type ColorTheme = 'default' | 'high-contrast' | 'warm';
export type FontSizeScale = 'normal' | 'large' | 'xlarge';
export type InfoDensity = 'simple' | 'standard';

export interface AccessibilitySettings {
  theme: ColorTheme;
  fontSize: FontSizeScale;
  density: InfoDensity;
  speechSpeed: number; // 0.8, 1.0, 1.2
  autoRead: boolean;
  soundFeedback: boolean;
}

export interface UserProfile {
  name: string;
  preferredName: string;
  avatar: string;
  caregiverName: string;
  caregiverEmail: string;
  caregiverPhone: string;
  points: number;
  streakDays: number;
  caregiverPin: string;
}

export interface TaskStep {
  id: string;
  stepNumber: number;
  instruction: string;
  icon: string;
  photoUrl?: string;
  detailTip?: string;
  completed?: boolean;
}

export interface Task {
  id: string;
  title: string;
  category: 'routine' | 'medicine' | 'meal' | 'leisure';
  estimatedMinutes: number;
  steps: TaskStep[];
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
  isCaregiverAdded?: boolean;
  isAiGenerated?: boolean;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  category: 'routine' | 'medicine' | 'meal' | 'appointment' | 'leisure';
  completed: boolean;
  isCaregiverAdded?: boolean;
  taskId?: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  category: 'medicine' | 'meal' | 'appointment' | 'routine';
  repeat: 'never' | 'daily' | 'weekly';
  notifyCaregiverIfMissed: boolean;
  missedCount: number;
  lastTriggered?: string;
  isDismissed?: boolean;
}

export interface MoodLog {
  id: string;
  timestamp: string;
  level: 1 | 2 | 3 | 4 | 5; // 1: Very Happy, 2: Happy, 3: Okay, 4: Sad, 5: Stressed
  label: string;
  note?: string;
  calmingCompleted?: boolean;
  sharedWithHelper: boolean;
}

export interface MemoryContact {
  id: string;
  type: 'contact' | 'object';
  name: string;
  relationshipOrCategory: string;
  note: string;
  photoUrl: string;
  phone?: string;
}

export interface LifeSkillChoice {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
}

export interface LifeSkillStep {
  id: string;
  stepNumber: number;
  instruction: string;
  contextDesc: string;
  icon: string;
  choices?: LifeSkillChoice[];
}

export interface LifeSkillModule {
  id: string;
  title: string;
  category: string;
  icon: string;
  scenario: string;
  steps: LifeSkillStep[];
  completed: boolean;
  badgeReward: string;
  badgeIcon: string;
}

export interface SharedNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isPinned?: boolean;
  alertType?: 'info' | 'reminder' | 'lost';
}

export interface AlertFeedItem {
  id: string;
  type: 'missed_reminder' | 'lost_alert' | 'struggle_detected' | 'mood_alert';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export type VoiceTargetView =
  | 'home'
  | 'schedule'
  | 'tasks'
  | 'mood'
  | 'camera_helper'
  | 'navigation'
  | 'memory_aid'
  | 'life_skills'
  | 'rewards'
  | 'simplify'
  | 'settings'
  | 'help'
  | 'sanctuary'
  | 'breathe'
  | 'call_helper'
  | 'chat'
  | 'live_voice';

export interface CustomVoiceShortcut {
  id: string;
  phrase: string;
  targetView: VoiceTargetView;
  label: string;
  responseMessage?: string;
  createdAt: string;
}

export type ChatModelOption = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';

export type ChatPersonaOption =
  | 'compassionate_guide'
  | 'memory_coach'
  | 'plain_language'
  | 'caregiver_advisor';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: ChatModelOption;
  personaUsed?: ChatPersonaOption;
}

