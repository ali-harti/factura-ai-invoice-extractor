import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, loginUser, registerUser, googleLoginUser, logoutUser } from '../services/api';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const userData = await getMe();
        if (isMounted) {
          setUser(userData);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    const res = await loginUser({ email, password });
    setUser(res.user);
    return res.user;
  };

  const register = async ({ email, password, full_name }) => {
    const res = await registerUser({ email, password, full_name });
    // Auto-login after registration or let user login
    const loginRes = await loginUser({ email, password });
    setUser(loginRes.user);
    return loginRes.user;
  };

  const loginWithGoogle = async (credential) => {
    const res = await googleLoginUser({ token: credential });
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
