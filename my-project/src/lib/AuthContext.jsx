import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const WORKER_URL = import.meta.env.VITE_WORKER_URL || '';
const ADMIN_MODE_ENABLED = false;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]                   = useState(null);
  const [isAdmin, setIsAdmin]             = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  /* Check admin status against the Worker KV */
  const checkAdmin = useCallback(async (email) => {
    if (!email || !WORKER_URL) return false;
    try {
      const res = await fetch(`${WORKER_URL}/api/check-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return data.isAdmin === true || data.admin === true;
    } catch {
      return false;
    }
  }, []);

  /* Firebase auth state listener */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsAuthLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const admin = await checkAdmin(firebaseUser.email);
        setIsAdmin(admin);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsAuthLoading(false);
    });
    return unsub;
  }, [checkAdmin]);

  const signIn = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isAuthLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
