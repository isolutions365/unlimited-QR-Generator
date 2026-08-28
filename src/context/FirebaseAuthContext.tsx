import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  UserCredential,
  onAuthStateChanged,
  onIdTokenChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  loginWithEmail,
  signupWithEmail,
  loginWithGoogle,
  logoutFirebase,
  sendPasswordReset,
  verifyUserEmail,
  getFirebaseIdToken
} from '../lib/firebaseAuthServices';

interface FirebaseAuthContextType {
  user: User | null;
  loading: boolean;
  idToken: string | null;
  error: string | null;
  loginWithEmail: (email: string, pass: string) => Promise<UserCredential>;
  signupWithEmail: (email: string, pass: string, displayName?: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential | null>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  refreshToken: (forceRefresh?: boolean) => Promise<string | null>;
  clearError: () => void;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Safety timeout to ensure loading state resolves even if auth listener hangs
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    if (!auth) {
      setLoading(false);
      clearTimeout(safetyTimer);
      return;
    }

    let unsubscribeAuth: (() => void) | undefined;
    let unsubscribeToken: (() => void) | undefined;

    try {
      // Persistent listener for Firebase Authentication state changes
      unsubscribeAuth = onAuthStateChanged(
        auth,
        async (currentUser) => {
          clearTimeout(safetyTimer);
          setUser(currentUser);
          if (currentUser) {
            try {
              const token = await currentUser.getIdToken();
              setIdToken(token);
            } catch (tokenErr: any) {
              console.warn('[FirebaseAuthContext] Token retrieval notice:', tokenErr);
              setIdToken(null);
            }
          } else {
            setIdToken(null);
          }
          setLoading(false);
        },
        (authErr) => {
          clearTimeout(safetyTimer);
          console.error('[FirebaseAuthContext] Listener error:', authErr);
          setError(authErr.message);
          setLoading(false);
        }
      );

      // Listen for Token refresh events
      unsubscribeToken = onIdTokenChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const freshToken = await currentUser.getIdToken();
            setIdToken(freshToken);
          } catch {
            setIdToken(null);
          }
        } else {
          setIdToken(null);
        }
      });
    } catch (err: any) {
      console.warn('[FirebaseAuthContext] Listener setup notice:', err);
      clearTimeout(safetyTimer);
      setLoading(false);
    }

    return () => {
      clearTimeout(safetyTimer);
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeToken) unsubscribeToken();
    };
  }, []);

  const handleLoginWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      return await loginWithEmail(email, pass);
    } catch (err: any) {
      setError(err.message || 'Email authentication failed');
      throw err;
    }
  };

  const handleSignupWithEmail = async (email: string, pass: string, displayName?: string) => {
    setError(null);
    try {
      return await signupWithEmail(email, pass, displayName);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const handleLoginWithGoogle = async () => {
    setError(null);
    try {
      return await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      throw err;
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await logoutFirebase();
      setUser(null);
      setIdToken(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    }
  };

  const handleSendPasswordReset = async (email: string) => {
    setError(null);
    try {
      await sendPasswordReset(email);
    } catch (err: any) {
      setError(err.message || 'Password reset email failed');
      throw err;
    }
  };

  const handleSendEmailVerification = async () => {
    setError(null);
    try {
      await verifyUserEmail(user);
    } catch (err: any) {
      setError(err.message || 'Email verification failed');
      throw err;
    }
  };

  const handleRefreshToken = async (forceRefresh: boolean = false) => {
    try {
      const fresh = await getFirebaseIdToken(forceRefresh);
      setIdToken(fresh);
      return fresh;
    } catch (err: any) {
      console.warn('[FirebaseAuthContext] Manual token refresh notice:', err);
      return null;
    }
  };

  const clearError = () => setError(null);

  return (
    <FirebaseAuthContext.Provider
      value={{
        user,
        loading,
        idToken,
        error,
        loginWithEmail: handleLoginWithEmail,
        signupWithEmail: handleSignupWithEmail,
        loginWithGoogle: handleLoginWithGoogle,
        logout: handleLogout,
        sendPasswordReset: handleSendPasswordReset,
        sendEmailVerification: handleSendEmailVerification,
        refreshToken: handleRefreshToken,
        clearError
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}
