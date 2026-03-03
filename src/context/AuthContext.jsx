import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const userData = await authApi.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const { user: userData, accessToken } = await authApi.login(credentials);
      // Set user FIRST so isAuthenticated is true before navigation
      setUser(userData);
      toast.success('Login successful!');
      navigate('/dashboard', { replace: true });
      return { user: userData, accessToken };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { user: newUser, accessToken } = await authApi.register(userData);
      // Set user FIRST so isAuthenticated is true before navigation
      setUser(newUser);
      toast.success('Registration successful!');
      navigate('/dashboard', { replace: true });
      return { user: newUser, accessToken };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear user state and navigate, even if API call fails
      setUser(null);
      toast.info('Logged out successfully');
      navigate('/login', { replace: true });
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};