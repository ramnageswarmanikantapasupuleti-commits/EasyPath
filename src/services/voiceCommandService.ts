// Web Speech API Voice Command Service for EasyPath
// Robust parsing, role-aware navigation, and fuzzy matching for accessibility
import { CustomVoiceShortcut } from '../types';

export interface VoiceCommandAction {
  id: string;
  command: string;
  aliases: string[];
  description: string;
  action: (context: any) => void;
}

export const VOICE_COMMANDS: VoiceCommandAction[] = [
  {
    id: 'cmd-home',
    command: 'Go home',
    aliases: [
      'home',
      'go home',
      'go to home',
      'main screen',
      'dashboard',
      'take me home',
      'back to home',
      'start screen',
      'home screen',
      'alex home',
    ],
    description: 'Go to your home dashboard',
    action: (ctx) => {
      if (ctx.role === 'caregiver') {
        ctx.setCaregiverView('dashboard');
        ctx.speak('Going to Caregiver Dashboard.');
      } else {
        ctx.setActiveView('home');
        ctx.speak('Going to your home dashboard.');
      }
    },
  },
  {
    id: 'cmd-tasks',
    command: 'Show tasks',
    aliases: [
      'tasks',
      'my tasks',
      'open tasks',
      'show tasks',
      'to do',
      'todo',
      'show my tasks',
      'view tasks',
      'daily tasks',
      'my steps',
      'checklist',
      'task list',
      'routine steps',
    ],
    description: 'Open your task list or task manager',
    action: (ctx) => {
      if (ctx.role === 'caregiver') {
        ctx.setCaregiverView('tasks');
        ctx.speak('Opening Caregiver Task Manager.');
      } else {
        ctx.setActiveView('tasks');
        ctx.speak('Opening your daily tasks.');
      }
    },
  },
  {
    id: 'cmd-schedule',
    command: 'Show schedule',
    aliases: [
      'schedule',
      'calendar',
      'my schedule',
      'today schedule',
      'open schedule',
      'show schedule',
      'what is next',
      'routine',
      'my routine',
      'agenda',
      'timeline',
      'reminders',
      'daily schedule',
      'events',
    ],
    description: 'View daily schedule and timeline',
    action: (ctx) => {
      if (ctx.role === 'caregiver') {
        ctx.setCaregiverView('schedule');
        ctx.speak('Opening Caregiver Schedule Editor.');
      } else {
        ctx.setActiveView('schedule');
        ctx.speak('Here is your daily schedule.');
      }
    },
  },
  {
    id: 'cmd-camera',
    command: 'Open camera',
    aliases: [
      'camera',
      'open camera',
      'camera helper',
      'explain this',
      'take picture',
      'take photo',
      'scan letter',
      'scan document',
      'read letter',
      'read bottle',
      'read label',
      'photo helper',
      'point camera',
    ],
    description: 'Open Camera Helper to explain a letter or object',
    action: (ctx) => {
      if (ctx.role === 'caregiver') ctx.setRole('user');
      ctx.setActiveView('camera_helper');
      ctx.speak('Opening Camera Helper. Point at any letter or object.');
    },
  },
  {
    id: 'cmd-simplify',
    command: 'Simplify text',
    aliases: [
      'simplify',
      'simplify text',
      'text simplifier',
      'read notice',
      'make text easy',
      'explain letter',
      'plain words',
      'simple text',
      'decode letter',
    ],
    description: 'Open the Text Simplifier tool',
    action: (ctx) => {
      if (ctx.role === 'caregiver') ctx.setRole('user');
      ctx.setActiveView('simplify');
      ctx.speak('Opening Text Simplifier to explain in plain words.');
    },
  },
  {
    id: 'cmd-navigation',
    command: 'Safe walk',
    aliases: [
      'navigation',
      'safe walk',
      'safe navigation',
      'directions',
      'walk home',
      'how to get home',
      'where to go',
      'landmark navigation',
      'landmark walk',
      'map',
    ],
    description: 'Open safe landmark navigation directions',
    action: (ctx) => {
      if (ctx.role === 'caregiver') ctx.setRole('user');
      ctx.setActiveView('navigation');
      ctx.speak('Opening Safe Walk directions with familiar landmarks.');
    },
  },
  {
    id: 'cmd-lost',
    command: "I'm lost",
    aliases: [
      "i'm lost",
      'i am lost',
      'lost',
      'help me i am lost',
      'emergency lost',
      'lost alert',
      'where am i',
      'panic lost',
    ],
    description: 'Alert your helper and share your current location',
    action: (ctx) => {
      ctx.triggerImLost('Spoken voice alert: I am lost');
      ctx.speak('Your helper has been alerted and given your location. You are safe.');
    },
  },
  {
    id: 'cmd-mood',
    command: 'Mood check in',
    aliases: [
      'mood',
      'mood check',
      'mood check in',
      'feeling',
      'how i feel',
      'how am i feeling',
      'log mood',
      'check in',
      'emotional check in',
      'feelings journal',
    ],
    description: 'Log your feelings and emotional check-in',
    action: (ctx) => {
      if (ctx.role === 'caregiver') ctx.setRole('user');
      ctx.setActiveView('mood');
      ctx.speak('Opening mood check in. How are you feeling right now?');
    },
  },
  {
    id: 'cmd-breathe',
    command: 'Calm breathing',
    aliases: [
      'breathe',
      'breathing',
      'take a breath',
      'calm breathing',
      'relax',
      'calm down',
      'calming exercise',
      'deep breath',
      'anxious',
      'stress relief',
    ],
    description: 'Start the soothing calming breathing circle',
    action: (ctx) => {
      ctx.setShowCalmingModal(true);
      ctx.speak('Starting gentle breathing exercise. Follow the glowing circle.');
    },
  },
  {
    id: 'cmd-sanctuary',
    command: 'Calming sanctuary',
    aliases: [
      'sanctuary',
      'calming sanctuary',
      '3d garden',
      'garden',
      'zen garden',
      'fountain',
      'open sanctuary',
      'peaceful garden',
      'peaceful sanctuary',
      'water fountain',
      'peaceful place',
    ],
    description: 'Open the 3D Zen garden and soothing water fountain',
    action: (ctx) => {
      ctx.setIsSanctuaryOpen(true);
      ctx.speak('Opening your 3D Calming Sanctuary.');
    },
  },
  {
    id: 'cmd-memory',
    command: 'Memory aid',
    aliases: [
      'memory',
      'memory aid',
      'contacts',
      'who is this',
      'people',
      'my people',
      'my items',
      'my belongings',
      'important contacts',
      'family',
    ],
    description: 'View saved people, contacts, and belongings',
    action: (ctx) => {
      if (ctx.role === 'caregiver') ctx.setRole('user');
      ctx.setActiveView('memory_aid');
      ctx.speak('Opening your Memory Aid library.');
    },
  },
  {
    id: 'cmd-lifeskills',
    command: 'Life skills',
    aliases: [
      'life skills',
      'skills coach',
      'practice',
      'practice shopping',
      'shopping practice',
      'practice phone call',
      'skills',
      'simulation',
    ],
    description: 'Practice everyday real-world skills and simulations',
    action: (ctx) => {
      if (ctx.role === 'caregiver') ctx.setRole('user');
      ctx.setActiveView('life_skills');
      ctx.speak('Opening Life Skills coach.');
    },
  },
  {
    id: 'cmd-rewards',
    command: 'My rewards',
    aliases: [
      'rewards',
      'my rewards',
      'trophies',
      'trophy shelf',
      'points',
      'my points',
      'badges',
      'my streak',
      'achievements',
    ],
    description: 'Check your points, trophies, and streak',
    action: (ctx) => {
      if (ctx.role === 'caregiver') ctx.setRole('user');
      ctx.setActiveView('rewards');
      ctx.speak(`You have ${ctx.profile.points} points and a ${ctx.profile.streakDays} day routine streak.`);
    },
  },
  {
    id: 'cmd-notes',
    command: 'Shared notes',
    aliases: [
      'notes',
      'shared notes',
      'caregiver notes',
      'messages',
      'helper notes',
      'sarah notes',
      'family notes',
      'note board',
    ],
    description: 'Open shared notes between Alex and Caregiver',
    action: (ctx) => {
      if (ctx.role !== 'caregiver') {
        ctx.setRole('caregiver');
      }
      ctx.setCaregiverView('notes');
      ctx.speak('Opening shared caregiver notes board.');
    },
  },
  {
    id: 'cmd-progress',
    command: 'Caregiver progress',
    aliases: [
      'progress',
      'caregiver progress',
      'analytics',
      'activity log',
      'completion rate',
      'routine progress',
      'alex progress',
    ],
    description: 'Open Caregiver analytics and progress overview',
    action: (ctx) => {
      if (ctx.role !== 'caregiver') {
        ctx.setRole('caregiver');
      }
      ctx.setCaregiverView('progress');
      ctx.speak('Opening routine progress and analytics.');
    },
  },
  {
    id: 'cmd-profile',
    command: 'My profile',
    aliases: [
      'profile',
      'my profile',
      'user profile',
      'alex profile',
      'account',
      'care profile',
    ],
    description: 'Open the personal care profile',
    action: (ctx) => {
      if (ctx.role === 'caregiver') ctx.setRole('user');
      ctx.setActiveView('profile');
      ctx.speak('Opening your profile.');
    },
  },
  {
    id: 'cmd-helper',
    command: 'Call helper',
    aliases: [
      'call helper',
      'call sarah',
      'call my helper',
      'call caregiver',
      'phone helper',
      'need helper',
      'phone call',
      'call my daughter',
    ],
    description: 'Place a direct phone call to your caregiver',
    action: (ctx) => {
      ctx.speak(`Calling your helper ${ctx.profile.caregiverName} now.`);
      window.location.href = `tel:${ctx.profile.caregiverPhone}`;
    },
  },
  {
    id: 'cmd-dictate',
    command: 'Voice dictate',
    aliases: [
      'dictate',
      'voice dictate',
      'transcribe',
      'record voice',
      'voice note',
      'gemini transcribe',
      'speech to text',
      'record memo',
    ],
    description: 'Dictate a note or task with Gemini 3.5 Transcribe',
    action: (ctx) => {
      ctx.openTranscriber();
      ctx.speak('Opening voice dictation.');
    },
  },
  {
    id: 'cmd-videoguide',
    command: 'Video guide',
    aliases: [
      'video',
      'video guide',
      'show video',
      'watch demo',
      'video demonstration',
      'step video',
      'how to video',
    ],
    description: 'Watch an AI video step-by-step demonstration',
    action: (ctx) => {
      ctx.openVideoGuide();
      ctx.speak('Opening video step guide.');
    },
  },
  {
    id: 'cmd-switch-role',
    command: 'Switch role',
    aliases: [
      'switch role',
      'switch mode',
      'caregiver mode',
      'helper mode',
      'user mode',
      'alex mode',
      'switch to caregiver',
      'switch to user',
      'caregiver dashboard',
    ],
    description: 'Switch between User and Caregiver views',
    action: (ctx) => {
      const nextRole = ctx.role === 'user' ? 'caregiver' : 'user';
      ctx.setRole(nextRole);
      ctx.speak(`Switched to ${nextRole === 'user' ? 'User Mode for Alex' : 'Caregiver Dashboard for Sarah'}.`);
    },
  },
  {
    id: 'cmd-help',
    command: 'I need help',
    aliases: [
      'help',
      'i need help',
      'adaptive help',
      'stuck',
      'i am stuck',
      'show help',
      'confused',
      'i am confused',
      'help menu',
    ],
    description: 'Open adaptive calming help menu',
    action: (ctx) => {
      ctx.setShowAdaptiveModal(true);
      ctx.speak('Opening help menu. We are here with you.');
    },
  },
  {
    id: 'cmd-support',
    command: 'Support guide',
    aliases: [
      'support',
      'support guide',
      'help guide',
      'faq',
      'user guide',
      'how to use',
      'instructions',
    ],
    description: 'Open EasyPath instructions and support guide',
    action: (ctx) => {
      if (ctx.role === 'caregiver') ctx.setRole('user');
      ctx.setActiveView('help');
      ctx.speak('Opening EasyPath user and caregiver support guide.');
    },
  },
  {
    id: 'cmd-settings',
    command: 'Open settings',
    aliases: [
      'settings',
      'open settings',
      'accessibility',
      'preferences',
      'my settings',
      'options',
      'change settings',
    ],
    description: 'Open accessibility settings and preferences',
    action: (ctx) => {
      if (ctx.role === 'caregiver') ctx.setRole('user');
      ctx.setActiveView('settings');
      ctx.speak('Opening accessibility settings.');
    },
  },
  {
    id: 'cmd-contrast',
    command: 'High contrast',
    aliases: [
      'high contrast',
      'toggle contrast',
      'dark mode',
      'high contrast mode',
      'yellow on black',
      'contrast mode',
      'light mode',
    ],
    description: 'Toggle high contrast yellow-on-black theme',
    action: (ctx) => {
      const nextTheme = ctx.settings.theme === 'high-contrast' ? 'default' : 'high-contrast';
      ctx.updateSettings({ theme: nextTheme });
      ctx.speak(`Switched to ${nextTheme === 'high-contrast' ? 'High Contrast Mode' : 'Default Soft Blue Mode'}.`);
    },
  },
  {
    id: 'cmd-stop',
    command: 'Stop speaking',
    aliases: [
      'stop',
      'stop speaking',
      'be quiet',
      'stop talking',
      'cancel voice',
      'quiet',
      'silence',
      'mute voice',
    ],
    description: 'Immediately stop text-to-speech audio',
    action: (ctx) => {
      window.speechSynthesis?.cancel();
    },
  },
];

// Natural Language conversational prefixes to strip during speech recognition
const CONVERSATIONAL_PREFIXES = [
  'can you please open my',
  'can you please open the',
  'can you please show me my',
  'can you please show me',
  'can you please take me to',
  'can you please go to',
  'can you please open',
  'can you please show',
  'can you please',
  'could you please open my',
  'could you please show me',
  'could you please open',
  'could you please show',
  'could you please',
  'would you please',
  'can you open my',
  'can you show me my',
  'can you open the',
  'can you show me',
  'can you take me to',
  'can you open',
  'can you show',
  'can you go to',
  'can you',
  'could you',
  'i want to see my',
  'i want to open my',
  'i want to go to',
  'i want to see',
  'i want to open',
  'i want to',
  'i need to see my',
  'i need to see',
  'i need to open',
  'i need to',
  'take me to the',
  'take me to my',
  'take me to',
  'navigate to the',
  'navigate to',
  'show me my',
  'show me the',
  'show me',
  'bring up my',
  'bring up the',
  'bring up',
  'open up my',
  'open up the',
  'open up',
  'open the',
  'open my',
  'open',
  'go to the',
  'go to my',
  'go to',
  'go',
  'view my',
  'view the',
  'view',
  'start the',
  'start',
  'let us',
  "let's",
  'please',
];

/**
 * Normalizes speech input by trimming, lowercasing, and removing filler words and punctuation.
 */
export function normalizeTranscript(raw: string): { clean: string; core: string } {
  let clean = raw.toLowerCase().trim().replace(/[.,!?;:'"()[\]{}]/g, '').replace(/\s+/g, ' ');

  // Attempt prefix stripping
  let core = clean;
  for (const prefix of CONVERSATIONAL_PREFIXES) {
    if (core.startsWith(prefix + ' ')) {
      core = core.slice(prefix.length).trim();
      break;
    }
  }

  return { clean, core };
}

/**
 * Robust matching engine that evaluates:
 * 1. Custom user-defined shortcuts (exact, prefix-stripped, and substring)
 * 2. Exact standard command matches
 * 3. Prefix-stripped conversational matches (e.g. "please open my schedule" -> "my schedule")
 * 4. Token overlap scoring to rank the best matching action
 */
export function matchVoiceCommand(
  transcript: string,
  customShortcuts?: CustomVoiceShortcut[]
): VoiceCommandAction | null {
  if (!transcript || !transcript.trim()) return null;

  const { clean, core } = normalizeTranscript(transcript);

  // 1. Check custom user-defined shortcuts first
  if (customShortcuts && customShortcuts.length > 0) {
    for (const shortcut of customShortcuts) {
      const phrase = shortcut.phrase.toLowerCase().trim().replace(/[.,!?;:'"()[\]{}]/g, '');
      const phraseTokens = phrase.split(' ').filter(Boolean);

      // Match if exact match on clean or core
      if (
        clean === phrase ||
        core === phrase ||
        clean.includes(phrase) ||
        phrase.includes(clean) ||
        core.includes(phrase) ||
        phrase.includes(core)
      ) {
        return createCustomAction(shortcut);
      }

      // Check token match if shortcut has multi-word phrase
      if (phraseTokens.length > 1) {
        const matchesAllTokens = phraseTokens.every((token) => clean.includes(token));
        if (matchesAllTokens) {
          return createCustomAction(shortcut);
        }
      }
    }
  }

  // 2. Exact match against standard commands or aliases
  for (const cmd of VOICE_COMMANDS) {
    if (
      clean === cmd.command.toLowerCase() ||
      cmd.aliases.some((a) => clean === a.toLowerCase()) ||
      core === cmd.command.toLowerCase() ||
      cmd.aliases.some((a) => core === a.toLowerCase())
    ) {
      return cmd;
    }
  }

  // 3. Substring matching on whole words / key phrases
  for (const cmd of VOICE_COMMANDS) {
    for (const alias of cmd.aliases) {
      const aliasLower = alias.toLowerCase();
      // Require multi-character match to avoid false positive on single short letters
      if (aliasLower.length >= 3) {
        // Whole-word boundary match: \b<alias>\b
        const regex = new RegExp(`(^|\\s)${escapeRegex(aliasLower)}(\\s|$)`, 'i');
        if (regex.test(clean) || regex.test(core)) {
          return cmd;
        }
      }
    }
  }

  // 4. Token overlap fuzzy fallback
  let bestCmd: VoiceCommandAction | null = null;
  let bestScore = 0;
  const inputWords = new Set(clean.split(' ').filter((w) => w.length > 2));

  for (const cmd of VOICE_COMMANDS) {
    for (const alias of cmd.aliases) {
      const aliasWords = alias.toLowerCase().split(' ').filter((w) => w.length > 2);
      if (aliasWords.length === 0) continue;

      let matchCount = 0;
      for (const aw of aliasWords) {
        if (inputWords.has(aw)) {
          matchCount++;
        }
      }

      const score = matchCount / aliasWords.length;
      if (score >= 0.75 && score > bestScore) {
        bestScore = score;
        bestCmd = cmd;
      }
    }
  }

  return bestCmd;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createCustomAction(shortcut: CustomVoiceShortcut): VoiceCommandAction {
  return {
    id: `custom-${shortcut.id}`,
    command: shortcut.phrase,
    aliases: [shortcut.phrase],
    description: `Custom shortcut to ${shortcut.label}`,
    action: (ctx) => {
      if (shortcut.targetView === 'sanctuary') {
        ctx.setIsSanctuaryOpen(true);
      } else if (shortcut.targetView === 'breathe') {
        ctx.setShowCalmingModal(true);
      } else if (shortcut.targetView === 'call_helper') {
        ctx.speak(`Calling your helper ${ctx.profile.caregiverName} now.`);
        window.location.href = `tel:${ctx.profile.caregiverPhone}`;
        return;
      } else {
        // If caregiver role and navigating to user-only views, switch to user mode
        const userOnlyViews = ['mood', 'camera_helper', 'simplify', 'navigation', 'life_skills', 'rewards'];
        if (ctx.role === 'caregiver' && userOnlyViews.includes(shortcut.targetView)) {
          ctx.setRole('user');
        } else if (ctx.role === 'caregiver') {
          if (shortcut.targetView === 'schedule') ctx.setCaregiverView('schedule');
          else if (shortcut.targetView === 'tasks') ctx.setCaregiverView('tasks');
        }
        ctx.setActiveView(shortcut.targetView);
      }
      const spoken = shortcut.responseMessage || `Opening ${shortcut.label}.`;
      ctx.speak(spoken);
    },
  };
}
