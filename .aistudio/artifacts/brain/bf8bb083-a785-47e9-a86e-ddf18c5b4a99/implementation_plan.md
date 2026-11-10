# EasyPath — Accessibility-First Cognitive Support PWA

EasyPath is an accessibility-first Progressive Web App designed to empower individuals with cognitive disabilities, learning differences, dementia, autism, or acquired brain injuries to navigate daily life with greater independence. It provides an ultra-simplified, calm visual interface that breaks down complex tasks into manageable visual steps, delivers intelligent reminders, offers real-time voice guidance (TTS/STT), and leverages Gemini AI for task decomposition, text simplification, and real-world camera object/label explanation.

***

## User Review & Critical Decisions

> [!IMPORTANT]
> The following core product and architectural decisions have been confirmed and will guide the entire implementation:

- **Confirmed Decision 1 (AI Engine)**: AI features (task micro-step decomposition, plain-language text simplifier, and camera "Explain This to Me" / object identifier) will be powered by Google Gemini (`gemini-3.8-flash` with multimodal vision support) via secure server-side Express proxy endpoints using the pre-configured `GEMINI_API_KEY`.
- **Confirmed Decision 2 (Role Experience)**: Full dual-mode architecture featuring an instant quick-switcher between **Main User Mode** (calm, single-task-per-screen, 44px+ touch targets, voice-assisted) and **Caregiver Dashboard** (schedule manager, step-by-step task creator, alert threshold monitor, and shared notes).
- **Confirmed Decision 3 (Accessibility Profile)**: Prioritized general cognitive accessibility with customizable visual presets (font sizes from 18px to 32px, Default / High Contrast / Warm themes, adjustable information density, and speech speed rates).

***

## 1. Overview & Core Concept

### What It Does
EasyPath transforms everyday digital friction into an unhurried, reassuring companion:
- **One-Thing-At-A-Time Experience**: Displays single tasks with large visual icons, plain instructions, audio readouts, and step progression.
- **Gemini Task Breakdown Engine**: Turns broad goals (e.g. "Pack gym bag" or "Make tea") into 4–6 plain-language visual micro-steps.
- **Smart Reminders & Schedule**: Gentle audio-visual cues with non-punitive re-prompts and simulated caregiver escalation.
- **Explain This to Me (Camera Helper)**: Allows users to photograph bills, notices, or medicine boxes, receiving an instant spoken plain-language breakdown.
- **Memory Aid & Safe Navigation**: Visual contact book with relationships, quick phone dials, landmark-based step navigation, and an immediate "I'm Lost" caregiver alert button.
- **Life Skills & Mood Check-Ins**: Interactive simulations (e.g. store shopping, handling money) and 5-point face mood logging with guided calming breathing exercises.

### Target Audience & Persona
- **Primary**: Adults and young adults with mild-to-moderate intellectual disabilities, autism, ADHD, acquired brain injuries, or early-stage dementia seeking autonomy in daily routines.
- **Secondary**: Caregivers, family members, occupational therapists, and job coaches who need to configure routines, monitor task completion, and receive alerts without intruding on dignity.

### Key Value
Eliminates digital overwhelm through forgiving error handling (no penalties, easy undo, automatic assistance prompts), multimodal reassurance (audio + visual + text), and offline resilience.

***

## 2. User Experience & Visual Design

### Key User Flows
1. **Onboarding & Role Selection**: Welcomes user with automatic TTS greeting, selects role (User or Caregiver), configures comfort presets (font size, contrast theme, voice speed), and links helper.
2. **Daily Routine & Task Execution**: Home dashboard highlights "What's Next"; one tap enters step-by-step mode with auto-read instructions, large "Next Step" buttons, and celebration confetti.
3. **Camera Assistance**: Amber floating shutter button opens camera capture for documents/labels; Gemini Vision processes the image and speaks the plain summary.
4. **Caregiver Administration**: Caregiver toggles mode to add routine events, view completion statistics, post notes to the shared board, or test the "I'm Lost" escalation trigger.
5. **Calming Interventions**: Logging a stressed mood immediately suggests interactive calming activities (rhythmic breathing circle with soothing audio cues).

### Visual Identity & Theme
- **Aesthetic Direction**: Reassuring, warm, uncluttered, and tactile. Large touch targets ($\ge 44\text{px}$, primary CTAs $\ge 56\text{px}$), generous spacing, and soft rounded geometry (`rounded-2xl`).
- **Color Palette**:
  - Dominant Neutral Canvas (60%): Off-White Cream (`#FAF8F5`) / Deep Slate in High Contrast (`#0F172A`)
  - Structural Surfaces (30%): Pure White (`#FFFFFF`) / Dark Elevated Slate (`#1E293B`)
  - Primary Action (10%): Soft Sky Blue (`#4A90D9`) & Deep Ocean Blue (`#2C5F8A`)
  - Secondary Accents: Warm Sage Green (`#68B28A`), Sunny Amber (`#F5A623`) for Camera Action, Soft Coral (`#E8695A`) for Alerts, Calm Green (`#4CAF7D`) for Success
- **Typography & Scale**:
  - Headings: `Nunito` (rounded, friendly, high legibility)
  - Body & Labels: `Atkinson Hyperlegible` (distinguishable letterforms for low vision and cognitive ease)
  - Configurable body size: Standard (18px) scalable up to Extra-Large (28–32px)
  - Strict zero-pill discipline for metadata: clean unboxed text with typographic separators (`·`).
- **Interactive Feedback & Motion**:
  - Transitions: Gentle 250ms fade transitions with strict adherence to `prefers-reduced-motion`.
  - Non-flashing celebrations (calm floating stars and positive badges).
  - Tactile sound feedback option for button presses.

***

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full Dual-Role Capability with Top Switcher**:
  - *Chosen Approach*: Implement both Main User and Caregiver complete application shells with an accessible top-bar role switcher.
  - *Why*: Allows testers and evaluators to immediately experience both the supported user's simplified view and the caregiver's administrative controls in a single unified session.
- **Decision 2: Server-Side Gemini API Proxy**:
  - *Chosen Approach*: Route task decomposition, text simplification, and multimodal vision analysis through Express endpoints (`/api/ai/decompose`, `/api/ai/simplify`, `/api/ai/explain`).
  - *Why*: Adheres to server-side AI requirements, avoids exposing keys to browser bundles, and enables structured JSON schema validation.
- **Decision 3: Local-First IndexedDB/LocalStorage Persistence**:
  - *Chosen Approach*: Rich local persistence for tasks, routines, contacts, mood logs, and caregiver notes with instant cross-tab and offline synchronization.
  - *Why*: Guarantees instant UI responsiveness, zero setup barriers, and seamless offline PWA functionality.
- **Decision 4: Native Web Speech API with Fallback Controls**:
  - *Chosen Approach*: Integrated `useSpeech` hook for Text-to-Speech (TTS) and Speech-to-Text (STT) with speed adjustments and manual tap-to-read triggers.
  - *Why*: Immediate browser-native speech synthesis with zero latency and offline availability.

***

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BROWSER / CLIENT PWA                            │
│                                                                             │
│  ┌───────────────────────┐   ┌───────────────────────────────────────────┐  │
│  │    Top Role Bar       │   │           PWA Shell & Offline             │  │
│  │ [User Mode | Helper]  │   │ [Service Worker | Manifest | Install Btn] │  │
│  └───────────┬───────────┘   └─────────────────────┬─────────────────────┘  │
│              ▼                                     ▼                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Active View Controller                         │  │
│  │                                                                       │  │
│  │  [MAIN USER VIEWS]                     [CAREGIVER VIEWS]              │  │
│  │  • Home Dashboard (/home)              • Helper Dashboard (/helper)   │  │
│  │  • Task Step Runner (/step/:id)        • Routine & Schedule Planner   │  │
│  │  • Daily Timeline (/schedule)          • Task Creator (with AI steps) │  │
│  │  • Camera Helper (/camera)             • Alert Thresholds & Monitor   │  │
│  │  • Memory Aid (/memory)                • Shared Notes Board           │  │
│  │  • Safe Navigation & I'm Lost          • Progress & Analytics         │  │
│  │  • Mood Check & Calming Circles                                       │  │
│  │  • Text Simplifier & Library                                          │  │
│  │  • Gamification & Trophy Shelf                                        │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────┴───────────────────────────────────┐  │
│  │                        Core Client Services                           │  │
│  │  • useSpeech (Web Speech TTS/STT)  • usePreferences (Themes & Fonts)  │  │
│  │  • useAppState (Zustand / Local)   • usePWAInstall (Install Prompt)   │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │ HTTP / JSON
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVER (server.ts / Express)                      │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       API Proxy Endpoints                             │  │
│  │  • POST /api/ai/decompose-task   (Goal -> Structured Micro-Steps)     │  │
│  │  • POST /api/ai/simplify-text    (Complex Text -> Plain Language)     │  │
│  │  • POST /api/ai/explain-image    (Vision Analysis -> Audio-Ready Exp) │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │ GoogleGenAI SDK                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       Google Gemini Models                            │  │
│  │  • gemini-3.8-flash (Text Decomposition & Simplification)             │  │
│  │  • gemini-3.8-flash (Multimodal Vision for Camera Helper)             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Models & State Entities
- **Profile & Settings**:
  - `role`: `'user' | 'caregiver'`
  - `name`, `avatar`, `speechSpeed`: `0.8 | 1.0 | 1.2`
  - `fontSize`: `'normal' (18px) | 'large' (22px) | 'xlarge' (28px)`
  - `theme`: `'default' | 'high-contrast' | 'warm'`
  - `caregiverPin`: 4-digit security code
- **Tasks & Micro-Steps**:
  - `id`, `title`, `category`: `'routine' | 'medicine' | 'meal' | 'leisure'`
  - `steps`: Array of `{ id, order, instruction, icon, photoUrl, completed }`
  - `points`: gamification points (e.g. 10)
  - `status`: `'pending' | 'in-progress' | 'completed'`
- **Schedule Events**:
  - `id`, `title`, `time`: (e.g., `'08:00 AM'`), `category`, `completed`, `isCaregiverAdded`
- **Reminders**:
  - `id`, `title`, `time`, `repeat`, `escalateAfterMisses`: number, `missedCount`: number
- **Mood Logs**:
  - `id`, `timestamp`, `level`: `1` (Very Happy) to `5` (Stressed), `notes`, `calmingCompleted`
- **Memory Contacts & Objects**:
  - `id`, `type`: `'contact' | 'object'`, `name`, `relationship`, `notes`, `photoUrl`, `phone`
- **Shared Notes**:
  - `id`, `author`: `'User' | 'Helper'`, `content`, `timestamp`, `isPinned`

### Interactive Component Mapping & States
1. **`TaskRunner`**: Step index management, audio playback trigger, error attempt tracker (triggers automatic "Do you need help?" overlay after 3 struggle clicks), forward/back navigation, celebration confetti on final step.
2. **`CameraHelperModal`**: Live camera viewfinder or photo picker, preview mode, Gemini Vision upload with friendly pulsing skeleton, plain-language result card with TTS play and "Save to Memory" trigger.
3. **`NavigationSafeView`**: Step-by-step landmark card with large directional arrows, persistent bright red "I'm Lost" button that simulates real-time coordinates dispatch and brings up reassuring helper dial screen.
4. **`CalmingModal`**: Animated concentric breathing circle with expansion/contraction cues (4-second inhale, 4-second exhale) with peaceful sound effects.
5. **`PWAInstallBanner`**: Standard-compliant install button with iOS Safari step-by-step guidance.
