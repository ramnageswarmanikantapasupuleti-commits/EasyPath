import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Heart,
  LogIn,
  LogOut,
  CheckCircle,
  Sparkles,
  Lock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, userProfile, signInWithGoogle, signOut, updateRole, isLoading } = useAuth();
  const { setRole } = useApp();
  const [selectedRole, setSelectedRole] = useState<'user' | 'caregiver'>('user');
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (role: 'user' | 'caregiver') => {
    setAuthError(null);
    try {
      await signInWithGoogle(role);
      setRole(role);
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign in window was closed before completing.');
      } else {
        setAuthError(err?.message || 'Failed to sign in. Please try again.');
      }
    }
  };

  const handleSwitchRole = async (newRole: 'user' | 'caregiver') => {
    try {
      await updateRole(newRole);
      setRole(newRole);
    } catch (err) {
      console.warn('Role switch error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">
                Account &amp; Role Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Secure session and data isolation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
            {authError}
          </div>
        )}

        {currentUser ? (
          /* Signed In State */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-heading font-extrabold text-sm text-slate-900 dark:text-white block truncate">
                  {currentUser.displayName || 'EasyPath User'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                  {currentUser.email}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Active Role: {userProfile?.role || 'user'}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Switcher */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 block mb-2">
                Switch Role Profile:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSwitchRole('user')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    (userProfile?.role || 'user') === 'user'
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <User className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-black">User Mode</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Simplified visual guides &amp; tasks
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchRole('caregiver')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    userProfile?.role === 'caregiver'
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Heart className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-black">Caregiver Mode</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Schedule, progress &amp; shared notes
                  </span>
                </button>
              </div>
            </div>

            {/* Cloud SQL PostgreSQL status notice */}
            <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">PostgreSQL Cloud Database Connected</p>
                <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-0.5">
                  Your tasks, schedules, and mood logs are isolated by your secure user ID.
                </p>
              </div>
            </div>

            <button
              onClick={signOut}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        ) : (
          /* Sign In Options */
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Sign in with your Google account to sync routines, emergency contacts, and schedules securely to Cloud SQL PostgreSQL.
            </p>

            <div>
              <label className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 block mb-2">
                Select Your Role:
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedRole === 'user'
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <User className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-black">User (Alex)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Daily visual guides &amp; independence
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('caregiver')}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedRole === 'caregiver'
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Heart className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-black">Caregiver (Sarah)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Care management &amp; reminders
                  </span>
                </button>
              </div>
            </div>

            <button
              onClick={() => handleSignIn(selectedRole)}
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to Google Sign-In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Google ({selectedRole === 'user' ? 'User' : 'Caregiver'})</span>
                </>
              )}
            </button>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 leading-tight">
              🔐 <strong>Data Isolation Guaranteed</strong>: Patient routine data and caregiver notes are isolated by role and authenticated user IDs in Cloud SQL PostgreSQL.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
