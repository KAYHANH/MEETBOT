import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(api.token);
  const [loading, setLoading] = useState(true);
  const isDemoMode = api.isDemoSessionToken(token);

  const fetchUser = useCallback(async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      api.clearToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      setLoading(true);
      api.setToken(token);
      fetchUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async () => {
    try {
      const authUrl = await api.getAuthUrl();
      if (!authUrl) {
        throw new Error('Authentication URL is missing');
      }
      window.location.href = authUrl;
    } catch (err) {
      console.error('Login error:', err);
      alert('Failed to initiate login');
    }
  };

  const loginDemo = async () => {
    try {
      const result = await api.loginDemo();
      setLoading(true);
      setToken(result.token);
    } catch (err) {
      console.error('Demo login error:', err);
      alert('Failed to start demo mode');
    }
  };

  const handleCallback = (newToken) => {
    setLoading(true);
    api.setToken(newToken);
    setToken(newToken);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      api.clearToken();
      setToken(null);
      setUser(null);
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginDemo, logout, handleCallback, isDemoMode, canUseDemo: api.canUseDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
