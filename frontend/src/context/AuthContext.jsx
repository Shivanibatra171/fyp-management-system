import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('fyp_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('fyp_token') || null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('fyp_token')));

  // Initialize and verify authentication on app load
  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('fyp_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('fyp_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('[AuthContext] Token verification failed:', error.message);
          localStorage.removeItem('fyp_token');
          localStorage.removeItem('fyp_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success && res.data?.token) {
      const authToken = res.data.token;
      const authUser = res.data.user;

      localStorage.setItem('fyp_token', authToken);
      localStorage.setItem('fyp_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      return authUser;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  // Register handler (students)
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.success && res.data?.token) {
      const authToken = res.data.token;
      const authUser = res.data.user;

      localStorage.setItem('fyp_token', authToken);
      localStorage.setItem('fyp_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
      return authUser;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('fyp_user', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (error) {
      console.error('[AuthContext] Refresh user error:', error.message);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('fyp_token');
    localStorage.removeItem('fyp_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        refreshUser,
        logout,
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
