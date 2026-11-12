import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserRole,
  AccessibilitySettings,
  UserProfile,
  Task,
  TaskStep,
  ScheduleEvent,
  Reminder,
  MoodLog,
  MemoryContact,
  LifeSkillModule,
  SharedNote,
  AlertFeedItem,
  Badge,
  CustomVoiceShortcut,
} from '../types';
import { playGentleChime } from '../hooks/useSpeech';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  caregiverView: string;
  setCaregiverView: (view: string) => void;

  settings: AccessibilitySettings;
  updateSettings: (partial: Partial<AccessibilitySettings>) => void;

  profile: UserProfile;
  updateProfile: (partial: Partial<UserProfile>) => void;

  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, partial: Partial<Task>) => void;
  completeTaskStep: (taskId: string, stepIndex: number) => void;
  completeTask: (taskId: string) => void;

  activeTaskId: string | null;
  activeStepIndex: number;
  startTask: (taskId: string, stepIndex?: number) => void;
  setActiveStepIndex: (index: number) => void;
  closeTaskRunner: () => void;

  schedule: ScheduleEvent[];
  addScheduleEvent: (event: ScheduleEvent) => void;
  toggleScheduleEvent: (id: string) => void;

  reminders: Reminder[];
  addReminder: (reminder: Reminder) => void;
  acknowledgeReminder: (id: string) => void;
  snoozeReminder: (id: string) => void;

  moodLogs: MoodLog[];
  logMood: (level: 1 | 2 | 3 | 4 | 5, label: string, note?: string) => void;

  contacts: MemoryContact[];
  addContact: (contact: MemoryContact) => void;
  deleteContact: (id: string) => void;

  lifeSkills: LifeSkillModule[];
  completeLifeSkill: (moduleId: string) => void;

  sharedNotes: SharedNote[];
  addSharedNote: (text: string) => void;

  alerts: AlertFeedItem[];
  addAlert: (alert: Omit<AlertFeedItem, 'id' | 'timestamp' | 'resolved'>) => void;
  resolveAlert: (id: string) => void;

  badges: Badge[];

  // Adaptive Help Engine
  struggleCount: number;
  incrementStruggle: () => void;
  resetStruggle: () => void;
  showAdaptiveModal: boolean;
  setShowAdaptiveModal: (show: boolean) => void;

  // I'm Lost emergency state
  isLostActive: boolean;
  triggerImLost: (locationDescription?: string) => void;
  cancelImLost: () => void;

  // Active Reminder overlay modal
  activeReminderPopup: Reminder | null;
  dismissReminderPopup: () => void;

  // Active Calming modal
  showCalmingModal: boolean;
  setShowCalmingModal: (show: boolean) => void;

  // 3D Calming Sanctuary
  isSanctuaryOpen: boolean;
  setIsSanctuaryOpen: (open: boolean) => void;

  // Audio Transcriber Modal (Gemini 3.5 Transcribe)
  isTranscriberOpen: boolean;
  setIsTranscriberOpen: (open: boolean) => void;
  openTranscriber: (callback?: (text: string) => void) => void;
  transcriptionCallback: ((text: string) => void) | null;

  // AI Video Guide Modal (Gemini Omni Flash)
  isVideoGuideOpen: boolean;
  setIsVideoGuideOpen: (open: boolean) => void;
  videoGuidePrompt: string;
  openVideoGuide: (prompt?: string) => void;

  // Live Voice Conversation Modal (Gemini 3.8 Live)
  isLiveVoiceOpen: boolean;
  setIsLiveVoiceOpen: (open: boolean) => void;

  // Custom User-Defined Voice Shortcuts
  customVoiceShortcuts: CustomVoiceShortcut[];
  addCustomVoiceShortcut: (shortcut: Omit<CustomVoiceShortcut, 'id' | 'createdAt'>) => void;
  deleteCustomVoiceShortcut: (id: string) => void;
  updateCustomVoiceShortcut: (id: string, partial: Partial<CustomVoiceShortcut>) => void;

  // Auth & Cloud SQL Account Modal
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // App Intro & Splash Animation
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
  replayIntroAnimation: () => void;

  resetAllData: () => void;
}

const defaultSettings: AccessibilitySettings = {
  theme: 'default',
  fontSize: 'normal',
  density: 'simple',
  speechSpeed: 1.0,
  autoRead: true,
  soundFeedback: true,
};

const defaultProfile: UserProfile = {
  name: 'Alex Rivera',
  preferredName: 'Alex',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  caregiverName: 'Sarah Jenkins',
  caregiverEmail: 'sarah.helper@easypath.org',
  caregiverPhone: '555-019-2834',
  points: 120,
  streakDays: 4,
  caregiverPin: '1234',
};

const initialTasks: Task[] = [
  {
    id: 'task-medicine',
    title: 'Morning Medicine & Water',
    category: 'medicine',
    estimatedMinutes: 5,
    status: 'pending',
    steps: [
      { id: 'm1', stepNumber: 1, instruction: 'Go to your kitchen table.', icon: 'Home', completed: false },
      { id: 'm2', stepNumber: 2, instruction: 'Pour a fresh cup of water.', icon: 'Cup', completed: false },
      { id: 'm3', stepNumber: 3, instruction: 'Take 1 blue pill from the morning slot.', icon: 'Pill', completed: false },
      { id: 'm4', stepNumber: 4, instruction: 'Drink the full cup of water.', icon: 'CheckCircle', completed: false },
    ],
  },
  {
    id: 'task-tea',
    title: 'Make a Warm Cup of Chamomile Tea',
    category: 'routine',
    estimatedMinutes: 7,
    status: 'pending',
    steps: [
      { id: 't1', stepNumber: 1, instruction: 'Fill the kettle with fresh water.', icon: 'Cup', completed: false },
      { id: 't2', stepNumber: 2, instruction: 'Press the kettle switch to turn it on.', icon: 'Sparkles', completed: false },
      { id: 't3', stepNumber: 3, instruction: 'Place one tea bag into your favourite mug.', icon: 'Cup', completed: false },
      { id: 't4', stepNumber: 4, instruction: 'Carefully pour hot water and let it steep for 3 minutes.', icon: 'Clock', completed: false },
      { id: 't5', stepNumber: 5, instruction: 'Remove the tea bag and enjoy safely.', icon: 'Heart', completed: false },
    ],
  },
  {
    id: 'task-bag',
    title: 'Pack Backpack for Afternoon Activity',
    category: 'routine',
    estimatedMinutes: 10,
    status: 'pending',
    steps: [
      { id: 'b1', stepNumber: 1, instruction: 'Find your blue backpack.', icon: 'ShoppingBag', completed: false },
      { id: 'b2', stepNumber: 2, instruction: 'Pack your water bottle.', icon: 'Cup', completed: false },
      { id: 'b3', stepNumber: 3, instruction: 'Put your bus pass and ID card in the front zip.', icon: 'Key', completed: false },
      { id: 'b4', stepNumber: 4, instruction: 'Zip the bag closed and place it by the door.', icon: 'CheckCircle', completed: false },
    ],
  },
];

const initialSchedule: ScheduleEvent[] = [
  { id: 'sch-1', title: 'Morning Medicine & Water', time: '08:00 AM', category: 'medicine', completed: false, taskId: 'task-medicine' },
  { id: 'sch-2', title: 'Healthy Breakfast (Toast & Fruit)', time: '08:45 AM', category: 'meal', completed: true },
  { id: 'sch-3', title: 'Morning Sunshine Walk in Park', time: '10:30 AM', category: 'leisure', completed: false },
  { id: 'sch-4', title: 'Community Activity Center Session', time: '02:00 PM', category: 'appointment', completed: false, isCaregiverAdded: true },
  { id: 'sch-5', title: 'Evening Dinner with Family', time: '06:30 PM', category: 'meal', completed: false },
];

const initialReminders: Reminder[] = [
  { id: 'rem-1', title: 'Take Evening Vitamin D', time: '07:00 PM', category: 'medicine', repeat: 'daily', notifyCaregiverIfMissed: true, missedCount: 0 },
  { id: 'rem-2', title: 'Drink a glass of water', time: '02:30 PM', category: 'routine', repeat: 'daily', notifyCaregiverIfMissed: false, missedCount: 0 },
  { id: 'rem-3', title: 'Doctor Appointment Check-in with Dr. Wilson', time: 'Tomorrow 10:00 AM', category: 'appointment', repeat: 'never', notifyCaregiverIfMissed: true, missedCount: 0 },
];

const initialMoodLogs: MoodLog[] = [
  { id: 'm-1', timestamp: 'Yesterday at 9:00 AM', level: 2, label: 'Happy', note: 'Had a wonderful breakfast!', sharedWithHelper: true },
  { id: 'm-2', timestamp: 'Yesterday at 4:30 PM', level: 3, label: 'Okay', note: 'A bit tired after shopping.', sharedWithHelper: true },
];

const initialContacts: MemoryContact[] = [
  {
    id: 'c-1',
    type: 'contact',
    name: 'Sarah Jenkins',
    relationshipOrCategory: 'Sister & Primary Helper',
    note: 'Sarah visits every Tuesday and Saturday. Call her anytime you feel worried.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    phone: '555-019-2834',
  },
  {
    id: 'c-2',
    type: 'contact',
    name: 'Dr. Arthur Wilson',
    relationshipOrCategory: 'Family Doctor',
    note: 'Clinic on High Street. Very friendly and helps with routine prescriptions.',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    phone: '555-014-9922',
  },
  {
    id: 'c-3',
    type: 'contact',
    name: 'Leo Martinez',
    relationshipOrCategory: 'Best Friend from Art Class',
    note: 'Loves painting and walks in the botanic garden.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    phone: '555-018-7731',
  },
  {
    id: 'o-1',
    type: 'object',
    name: 'Front Door House Keys',
    relationshipOrCategory: 'Everyday Item',
    note: 'Has a blue whale keychain. Always kept in the wooden bowl by the coat rack.',
    photoUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=300&q=80',
  },
];

const initialLifeSkills: LifeSkillModule[] = [
  {
    id: 'shopping',
    title: 'Buying Groceries at the Shop',
    category: 'Independence',
    icon: 'ShoppingBag',
    scenario: 'Practice how to pick items, wait in line calmly, and pay at the counter.',
    completed: false,
    badgeReward: 'Store Champion',
    badgeIcon: 'ShoppingBag',
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        instruction: 'Pick up a shopping basket near the entrance.',
        contextDesc: 'A basket keeps your hands free and items safe while you walk.',
        icon: 'ShoppingBag',
      },
      {
        id: 's2',
        stepNumber: 2,
        instruction: 'Find your item and check the expiry date.',
        contextDesc: 'Always look for bread that feels soft and has a date in the future.',
        icon: 'Search',
      },
      {
        id: 's3',
        stepNumber: 3,
        instruction: 'Cashier asks: "Do you have a store loyalty card?"',
        contextDesc: 'What is the best way to respond?',
        icon: 'Phone',
        choices: [
          { id: 'c1', label: 'Say "No thank you" politely', isCorrect: true, feedback: 'Wonderful! A polite "No thank you" is clear and friendly.' },
          { id: 'c2', label: 'Ignore them and walk away', isCorrect: false, feedback: 'Take a deep breath. It is always safe to say "No thank you".' },
        ],
      },
      {
        id: 's4',
        stepNumber: 4,
        instruction: 'Tap your card on the payment machine until it beeps.',
        contextDesc: 'Wait for the green checkmark before picking up your bag.',
        icon: 'CheckCircle',
      },
    ],
  },
  {
    id: 'phone-call',
    title: 'Making an Appointment Phone Call',
    category: 'Communication',
    icon: 'Phone',
    scenario: 'Practice calling the clinic to confirm your appointment time.',
    completed: true,
    badgeReward: 'Confident Caller',
    badgeIcon: 'Phone',
    steps: [
      {
        id: 'p1',
        stepNumber: 1,
        instruction: 'Have your name and calendar written in front of you.',
        contextDesc: 'Having notes ready removes worry before dialling.',
        icon: 'BookOpen',
      },
      {
        id: 'p2',
        stepNumber: 2,
        instruction: 'When answered, say: "Hello, my name is Alex. I am calling to confirm my time."',
        contextDesc: 'Speak at a calm, natural pace.',
        icon: 'Phone',
      },
      {
        id: 'p3',
        stepNumber: 3,
        instruction: 'Write down the time they give you and say thank you.',
        contextDesc: 'Always say goodbye before pressing end call.',
        icon: 'CheckCircle',
      },
    ],
  },
];

const initialSharedNotes: SharedNote[] = [
  { id: 'n-1', author: 'Sarah (Helper)', text: 'Hi Alex! I put the fresh chamomile tea in the top pantry shelf for you. Have a great day!', timestamp: 'Today, 8:15 AM', isPinned: true },
  { id: 'n-2', author: 'Alex (User)', text: 'Finished my morning walk in the park! The birds were singing.', timestamp: 'Today, 11:15 AM' },
];

const initialAlerts: AlertFeedItem[] = [
  { id: 'a-1', type: 'missed_reminder', title: 'Morning Vitamin Reminder', description: 'Alex had not acknowledged the 8:00 AM reminder yet.', timestamp: '8:45 AM', resolved: true },
];

const initialBadges: Badge[] = [
  { id: 'b-1', title: 'First Step Hero', description: 'Completed your very first task in EasyPath!', icon: 'Sparkles', unlocked: true, unlockedAt: '2 days ago' },
  { id: 'b-2', title: '4-Day Streak', description: 'Kept up with daily routines 4 days in a row!', icon: 'Heart', unlocked: true, unlockedAt: 'Today' },
  { id: 'b-3', title: 'Confident Caller', description: 'Mastered the phone call practice module!', icon: 'Phone', unlocked: true, unlockedAt: 'Yesterday' },
  { id: 'b-4', title: 'Calm Breathing Star', description: 'Completed a soothing breathing exercise when stressed.', icon: 'CheckCircle', unlocked: false },
  { id: 'b-5', title: 'Store Champion', description: 'Finish the grocery shopping life-skills module.', icon: 'ShoppingBag', unlocked: false },
];

const initialCustomVoiceShortcuts: CustomVoiceShortcut[] = [
  {
    id: 'sc-1',
    phrase: 'My schedule',
    targetView: 'schedule',
    label: 'My Schedule',
    responseMessage: 'Here is your daily schedule.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sc-2',
    phrase: 'Mood check',
    targetView: 'mood',
    label: 'Mood Check',
    responseMessage: 'Opening mood check in. How are you feeling?',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sc-3',
    phrase: 'My daily steps',
    targetView: 'tasks',
    label: 'My Tasks',
    responseMessage: 'Here are your steps for today.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sc-4',
    phrase: 'Calming garden',
    targetView: 'sanctuary',
    label: '3D Calming Sanctuary',
    responseMessage: 'Opening your peaceful 3D garden.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sc-5',
    phrase: 'Explain this letter',
    targetView: 'camera_helper',
    label: 'Camera Helper',
    responseMessage: 'Opening Camera Helper. Point at your letter.',
    createdAt: new Date().toISOString(),
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('easypath_role') as UserRole) || 'user';
  });

  const [activeView, setActiveView] = useState<string>('home');
  const [caregiverView, setCaregiverView] = useState<string>('dashboard');

  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('easypath_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('easypath_profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('easypath_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const [schedule, setSchedule] = useState<ScheduleEvent[]>(() => {
    const saved = localStorage.getItem('easypath_schedule');
    return saved ? JSON.parse(saved) : initialSchedule;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('easypath_reminders');
    return saved ? JSON.parse(saved) : initialReminders;
  });

  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => {
    const saved = localStorage.getItem('easypath_moods');
    return saved ? JSON.parse(saved) : initialMoodLogs;
  });

  const [contacts, setContacts] = useState<MemoryContact[]>(() => {
    const saved = localStorage.getItem('easypath_contacts');
    return saved ? JSON.parse(saved) : initialContacts;
  });

  const [lifeSkills, setLifeSkills] = useState<LifeSkillModule[]>(() => {
    const saved = localStorage.getItem('easypath_lifeskills');
    return saved ? JSON.parse(saved) : initialLifeSkills;
  });

  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>(() => {
    const saved = localStorage.getItem('easypath_notes');
    return saved ? JSON.parse(saved) : initialSharedNotes;
  });

  const [alerts, setAlerts] = useState<AlertFeedItem[]>(() => {
    const saved = localStorage.getItem('easypath_alerts');
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('easypath_badges');
    return saved ? JSON.parse(saved) : initialBadges;
  });

  // Adaptive engine
  const [struggleCount, setStruggleCount] = useState<number>(0);
  const [showAdaptiveModal, setShowAdaptiveModal] = useState<boolean>(false);

  // I'm Lost state
  const [isLostActive, setIsLostActive] = useState<boolean>(false);

  // Reminder popups
  const [activeReminderPopup, setActiveReminderPopup] = useState<Reminder | null>(null);

  // Calming modal
  const [showCalmingModal, setShowCalmingModal] = useState<boolean>(false);

  // 3D Calming Sanctuary
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState<boolean>(false);

  // Audio Transcriber Modal (Gemini 3.5 Transcribe)
  const [isTranscriberOpen, setIsTranscriberOpen] = useState<boolean>(false);
  const [transcriptionCallback, setTranscriptionCallback] = useState<((text: string) => void) | null>(null);

  const openTranscriber = (callback?: (text: string) => void) => {
    if (callback) {
      setTranscriptionCallback(() => callback);
    } else {
      setTranscriptionCallback(null);
    }
    setIsTranscriberOpen(true);
  };

  // AI Video Guide Modal (Gemini Omni Flash)
  const [isVideoGuideOpen, setIsVideoGuideOpen] = useState<boolean>(false);
  const [videoGuidePrompt, setVideoGuidePrompt] = useState<string>('How to safely cross the street');

  const openVideoGuide = (prompt?: string) => {
    if (prompt) {
      setVideoGuidePrompt(prompt);
    }
    setIsVideoGuideOpen(true);
  };

  // Live Voice Conversation Modal (Gemini 3.8 Live)
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState<boolean>(false);

  // Cloud SQL & Firebase Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // App Intro & Splash Animation (shown on initial load)
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    // Show splash screen on first visit of this browser session
    return !sessionStorage.getItem('easypath_seen_intro_v2');
  });

  const replayIntroAnimation = () => {
    setShowSplash(true);
  };

  // Custom User-Defined Voice Shortcuts State
  const [customVoiceShortcuts, setCustomVoiceShortcuts] = useState<CustomVoiceShortcut[]>(() => {
    const saved = localStorage.getItem('easypath_voice_shortcuts');
    return saved ? JSON.parse(saved) : initialCustomVoiceShortcuts;
  });

  useEffect(() => {
    localStorage.setItem('easypath_voice_shortcuts', JSON.stringify(customVoiceShortcuts));
  }, [customVoiceShortcuts]);

  const addCustomVoiceShortcut = (shortcut: Omit<CustomVoiceShortcut, 'id' | 'createdAt'>) => {
    const newShortcut: CustomVoiceShortcut = {
      ...shortcut,
      id: `sc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCustomVoiceShortcuts((prev) => [newShortcut, ...prev]);
    playGentleChime('success');
  };

  const deleteCustomVoiceShortcut = (id: string) => {
    setCustomVoiceShortcuts((prev) => prev.filter((s) => s.id !== id));
    playGentleChime('chime');
  };

  const updateCustomVoiceShortcut = (id: string, partial: Partial<CustomVoiceShortcut>) => {
    setCustomVoiceShortcuts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...partial } : s))
    );
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('easypath_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('easypath_settings', JSON.stringify(settings));
    // Apply theme and font scale classes to document root
    const root = document.documentElement;
    root.classList.remove('theme-default', 'theme-high-contrast', 'theme-warm', 'dark');
    root.classList.add(`theme-${settings.theme}`);
    if (settings.theme === 'high-contrast') {
      root.classList.add('dark');
    }

    root.classList.remove('text-scale-normal', 'text-scale-large', 'text-scale-xlarge');
    root.classList.add(`text-scale-${settings.fontSize}`);
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('easypath_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('easypath_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('easypath_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('easypath_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('easypath_moods', JSON.stringify(moodLogs));
  }, [moodLogs]);

  useEffect(() => {
    localStorage.setItem('easypath_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('easypath_lifeskills', JSON.stringify(lifeSkills));
  }, [lifeSkills]);

  useEffect(() => {
    localStorage.setItem('easypath_notes', JSON.stringify(sharedNotes));
  }, [sharedNotes]);

  useEffect(() => {
    localStorage.setItem('easypath_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('easypath_badges', JSON.stringify(badges));
  }, [badges]);

  const updateSettings = (partial: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  };

  const addTask = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
    // Also add to schedule if it's a today routine
    addScheduleEvent({
      id: `sch-${Date.now()}`,
      title: task.title,
      time: 'Next Available',
      category: task.category,
      completed: false,
      taskId: task.id,
      isCaregiverAdded: role === 'caregiver',
    });
  };

  const updateTask = (taskId: string, partial: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...partial } : t)));
  };

  const startTask = (taskId: string, stepIndex: number = 0) => {
    setActiveTaskId(taskId);
    setActiveStepIndex(stepIndex);
    setActiveView('task_runner');
    setStruggleCount(0);
    setShowAdaptiveModal(false);
  };

  const closeTaskRunner = () => {
    setActiveTaskId(null);
    setActiveStepIndex(0);
    setActiveView('tasks');
  };

  const completeTaskStep = (taskId: string, stepIndex: number) => {
    playGentleChime('chime');
    setStruggleCount(0);
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newSteps = [...t.steps];
        if (newSteps[stepIndex]) {
          newSteps[stepIndex].completed = true;
        }
        return { ...t, steps: newSteps };
      })
    );
  };

  const completeTask = (taskId: string) => {
    playGentleChime('success');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#4A90D9', '#68B28A', '#F5A623', '#4CAF7D'],
    });

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: 'completed',
          completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          steps: t.steps.map((s) => ({ ...s, completed: true })),
        };
      })
    );

    // Update schedule event status if linked
    setSchedule((prev) =>
      prev.map((e) => (e.taskId === taskId ? { ...e, completed: true } : e))
    );

    // Increment points
    setProfile((prev) => ({
      ...prev,
      points: prev.points + 10,
    }));
  };

  const addScheduleEvent = (event: ScheduleEvent) => {
    setSchedule((prev) => [...prev, event]);
  };

  const toggleScheduleEvent = (id: string) => {
    playGentleChime('chime');
    setSchedule((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  const addReminder = (reminder: Reminder) => {
    setReminders((prev) => [reminder, ...prev]);
  };

  const acknowledgeReminder = (id: string) => {
    playGentleChime('success');
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isDismissed: true } : r))
    );
    if (activeReminderPopup?.id === id) {
      setActiveReminderPopup(null);
    }
  };

  const snoozeReminder = (id: string) => {
    playGentleChime('chime');
    if (activeReminderPopup?.id === id) {
      setActiveReminderPopup(null);
    }
  };

  const logMood = (level: 1 | 2 | 3 | 4 | 5, label: string, note?: string) => {
    const newLog: MoodLog = {
      id: `m-${Date.now()}`,
      timestamp: 'Just now',
      level,
      label,
      note,
      sharedWithHelper: true,
    };
    setMoodLogs((prev) => [newLog, ...prev]);

    // If stressed or sad (levels 4 or 5), trigger suggestion for calming activity
    if (level >= 4) {
      playGentleChime('alert');
      setShowCalmingModal(true);
      // Alert caregiver in feed
      addAlert({
        type: 'mood_alert',
        title: `Alex reported feeling ${label}`,
        description: note || 'Alex checked in feeling stressed. Calming exercises were suggested.',
      });
    } else {
      playGentleChime('chime');
    }
  };

  const addContact = (contact: MemoryContact) => {
    setContacts((prev) => [contact, ...prev]);
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const completeLifeSkill = (moduleId: string) => {
    playGentleChime('success');
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
    setLifeSkills((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, completed: true } : m))
    );
    setProfile((prev) => ({
      ...prev,
      points: prev.points + 15,
    }));
  };

  const addSharedNote = (text: string) => {
    playGentleChime('chime');
    const newNote: SharedNote = {
      id: `n-${Date.now()}`,
      author: role === 'caregiver' ? 'Sarah (Helper)' : `${profile.preferredName || 'Alex'} (User)`,
      text,
      timestamp: 'Just now',
    };
    setSharedNotes((prev) => [newNote, ...prev]);
  };

  const addAlert = (alertData: Omit<AlertFeedItem, 'id' | 'timestamp' | 'resolved'>) => {
    const newAlert: AlertFeedItem = {
      ...alertData,
      id: `a-${Date.now()}`,
      timestamp: 'Just now',
      resolved: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

  const incrementStruggle = () => {
    setStruggleCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setShowAdaptiveModal(true);
        playGentleChime('alert');
        addAlert({
          type: 'struggle_detected',
          title: 'Alex needed help on a task step',
          description: 'The app detected 3 pauses or retries on a task step. Adaptive guidance was offered.',
        });
      }
      return next;
    });
  };

  const resetStruggle = () => {
    setStruggleCount(0);
  };

  const triggerImLost = (locationDesc: string = 'Corner of Market St & 4th Ave, near Blue Cafe') => {
    setIsLostActive(true);
    playGentleChime('alert');
    addAlert({
      type: 'lost_alert',
      title: '🚨 "I\'M LOST" BUTTON PRESSED',
      description: `Alex pressed the I\'m Lost button. Location reported: ${locationDesc}`,
      location: {
        lat: 37.7858,
        lng: -122.4065,
        address: locationDesc,
      },
    });
    // Add urgent shared note
    addSharedNote(`⚠️ Emergency Alert: I'm Lost button was pressed. Location: ${locationDesc}`);
  };

  const cancelImLost = () => {
    setIsLostActive(false);
    playGentleChime('chime');
  };

  const dismissReminderPopup = () => {
    setActiveReminderPopup(null);
  };

  const resetAllData = () => {
    localStorage.clear();
    setRole('user');
    setSettings(defaultSettings);
    setProfile(defaultProfile);
    setTasks(initialTasks);
    setSchedule(initialSchedule);
    setReminders(initialReminders);
    setMoodLogs(initialMoodLogs);
    setContacts(initialContacts);
    setLifeSkills(initialLifeSkills);
    setSharedNotes(initialSharedNotes);
    setAlerts(initialAlerts);
    setBadges(initialBadges);
    setActiveView('home');
    setCaregiverView('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeView,
        setActiveView,
        caregiverView,
        setCaregiverView,
        settings,
        updateSettings,
        profile,
        updateProfile,
        tasks,
        addTask,
        updateTask,
        completeTaskStep,
        completeTask,
        activeTaskId,
        activeStepIndex,
        startTask,
        setActiveStepIndex,
        closeTaskRunner,
        schedule,
        addScheduleEvent,
        toggleScheduleEvent,
        reminders,
        addReminder,
        acknowledgeReminder,
        snoozeReminder,
        moodLogs,
        logMood,
        contacts,
        addContact,
        deleteContact,
        lifeSkills,
        completeLifeSkill,
        sharedNotes,
        addSharedNote,
        alerts,
        addAlert,
        resolveAlert,
        badges,
        struggleCount,
        incrementStruggle,
        resetStruggle,
        showAdaptiveModal,
        setShowAdaptiveModal,
        isLostActive,
        triggerImLost,
        cancelImLost,
        activeReminderPopup,
        dismissReminderPopup,
        showCalmingModal,
        setShowCalmingModal,
        isSanctuaryOpen,
        setIsSanctuaryOpen,
        isTranscriberOpen,
        setIsTranscriberOpen,
        openTranscriber,
        transcriptionCallback,
        isVideoGuideOpen,
        setIsVideoGuideOpen,
        videoGuidePrompt,
        openVideoGuide,
        isLiveVoiceOpen,
        setIsLiveVoiceOpen,
        customVoiceShortcuts,
        addCustomVoiceShortcut,
        deleteCustomVoiceShortcut,
        updateCustomVoiceShortcut,
        isAuthModalOpen,
        setIsAuthModalOpen,
        showSplash,
        setShowSplash,
        replayIntroAnimation,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
