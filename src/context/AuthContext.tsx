import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

export interface AppUserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'user' | 'caregiver';
  createdAt?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: AppUserProfile | null;
  idToken: string | null;
  isLoading: boolean;
  signInWithGoogle: (preferredRole?: 'user' | 'caregiver') => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (newRole: 'user' | 'caregiver') => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUserProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync user with backend Cloud SQL PostgreSQL database
  const syncWithBackend = async (user: FirebaseUser, token: string, role?: 'user' | 'caregiver') => {
    try {
      const res = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: role || 'user',
          displayName: user.displayName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
      }
    } catch (err) {
      console.warn('Backend sync failed, continuing locally:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          setIdToken(token);
          await syncWithBackend(user, token);
        } catch (err) {
          console.warn('Failed to retrieve token:', err);
        }
      } else {
        setIdToken(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (preferredRole: 'user' | 'caregiver' = 'user') => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      setIdToken(token);
      await syncWithBackend(result.user, token, preferredRole);
    } catch (error: any) {
      console.warn('Sign in with Google error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setIdToken(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRole = async (newRole: 'user' | 'caregiver') => {
    if (!idToken) return;
    try {
      const res = await fetch('/api/auth/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.user);
      }
    } catch (err) {
      console.warn('Failed to update role in backend:', err);
    }
  };

  // Helper fetch that automatically attaches the Firebase ID token in Authorization header
  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (idToken) {
      headers.set('Authorization', `Bearer ${idToken}`);
    }
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        idToken,
        isLoading,
        signInWithGoogle,
        signOut,
        updateRole,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
