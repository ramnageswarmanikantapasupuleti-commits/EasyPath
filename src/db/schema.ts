import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table with role separation ('user' vs 'caregiver') and linking
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('user'), // 'user' | 'caregiver'
  caregiverUid: text('caregiver_uid'), // optional link to caregiver's UID
  createdAt: timestamp('created_at').defaultNow(),
});

// Tasks table isolated by user
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull().default('routine'),
  estimatedMinutes: integer('estimated_minutes').default(5),
  status: text('status').notNull().default('pending'), // 'pending' | 'completed' | 'in_progress'
  steps: text('steps').notNull(), // JSON stringified array of MicroSteps
  isAiGenerated: boolean('is_ai_generated').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Daily Schedule items isolated by user
export const schedules = pgTable('schedules', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  time: text('time').notNull(),
  category: text('category').default('routine'),
  completed: boolean('completed').default(false),
  icon: text('icon').default('Clock'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Mood check-in logs isolated by user
export const moodLogs = pgTable('mood_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  level: integer('level').notNull(),
  label: text('label').notNull(),
  note: text('note'),
  timestamp: text('timestamp').notNull(),
  sharedWithHelper: boolean('shared_with_helper').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Shared Notes between User and Caregiver
export const sharedNotes = pgTable('shared_notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // Target user whose care this pertains to
  author: text('author').notNull(),
  authorRole: text('author_role').notNull().default('caregiver'), // 'caregiver' | 'user'
  text: text('text').notNull(),
  timestamp: text('timestamp').notNull(),
  isPinned: boolean('is_pinned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Custom Voice Shortcuts isolated by user
export const voiceShortcuts = pgTable('voice_shortcuts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  phrase: text('phrase').notNull(),
  targetView: text('target_view').notNull(),
  label: text('label').notNull(),
  responseMessage: text('response_message'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  schedules: many(schedules),
  moodLogs: many(moodLogs),
  sharedNotes: many(sharedNotes),
  voiceShortcuts: many(voiceShortcuts),
}));
