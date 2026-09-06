import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAdditionalUserInfo
} from 'firebase/auth';
import GlobalLoader from '../components/ui/GlobalLoader';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const additionalInfo = getAdditionalUserInfo(result);
    if (additionalInfo?.isNewUser) {
      await result.user.delete();
      await signOut(auth);
      const error = new Error('No account found. Please sign up first.');
      error.code = 'auth/user-not-found';
      throw error;
    }
    return result;
  };

  const signupWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Trigger backend user creation/sync
          const token = await user.getIdToken();
          await fetch(`${API_URL}/api/v1/invoices/`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (err) {
          console.error('Failed to sync user with backend:', err);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    signupWithGoogle,
    loginWithEmail,
    signupWithEmail,
    resetPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <GlobalLoader /> : children}
    </AuthContext.Provider>
  );
};

