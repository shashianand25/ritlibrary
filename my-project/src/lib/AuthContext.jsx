import React, { createContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from './firebase.js';
import logger from '../utils/logger.js';

export const AuthContext = createContext(null);

const WORKER = import.meta.env.VITE_WORKER_URL || 'https://library-backend.ritlibrary.workers.dev';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const checkAdmin = useCallback(async (idToken) => {
    try {
      const res = await fetch(`${WORKER}/api/check-admin`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.isAdmin);
    } catch (e) {
      logger.warn('Admin check failed:', e);
      return false;
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const token = await u.getIdToken();
        const admin = await checkAdmin(token);
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
      logger.error('Sign-in error:', err);
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

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { useAuth } from './useAuth.js';
export default AuthProvider;
