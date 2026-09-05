import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const verifyToken = async () => {
      if (token) {
        try {
          await api.getMe(token);
          if (isMounted) localStorage.setItem('token', token);
        } catch (err) {
          if (isMounted) {
            setToken(null);
            localStorage.removeItem('token');
          }
        }
      } else {
        if (isMounted) localStorage.removeItem('token');
      }
      if (isMounted) setLoading(false);
    };
    verifyToken();
    return () => { isMounted = false; };
  }, []);

  const login = async (credentials: any) => {
    const data = await api.login(credentials);
    const newToken = data.access_token || data.token;
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const signup = async (userData: any) => {
    const data = await api.signup(userData);
    const newToken = data.access_token || data.token;
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const googleLogin = async (googleToken: string) => {
    const data = await api.verifyGoogle(googleToken);
    const newToken = data.access_token || data.token;
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    token,
    isAuthenticated: !!token,
    login,
    signup,
    googleLogin,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
