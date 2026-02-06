import { useAuthStore } from '@store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    hasRole,
    isAdmin,
    isTrainer,
    clearError,
  } = useAuthStore();

  const navigate = useNavigate();

  // Login with redirect
  const loginWithRedirect = async (credentials, redirectTo = '/dashboard') => {
    try {
      await login(credentials);
      navigate(redirectTo);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Register with redirect
  const registerWithRedirect = async (userData, redirectTo = '/dashboard') => {
    try {
      await register(userData);
      navigate(redirectTo);
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  // Logout with redirect
  const logoutWithRedirect = async (redirectTo = '/login') => {
    try {
      await logout();
      navigate(redirectTo);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if user can access route
  const canAccess = (allowedRoles = []) => {
    if (!isAuthenticated) return false;
    if (allowedRoles.length === 0) return true;
    return hasRole(allowedRoles);
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loginWithRedirect,
    registerWithRedirect,
    logoutWithRedirect,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    hasRole,
    isAdmin,
    isTrainer,
    canAccess,
    clearError,
  };
};
