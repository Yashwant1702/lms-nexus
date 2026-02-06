import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { authService } from '@services/authService';
import { storageService } from '@services/storageService';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions
        setUser: (user) => set({ user, isAuthenticated: !!user }),

        setToken: (token) => set({ token }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        // Initialize auth from storage
        initializeAuth: async () => {
          try {
            const token = storageService.getToken();
            const user = storageService.getUser();

            if (token && user) {
              set({ token, user, isAuthenticated: true });

              // Verify token is still valid
              try {
                const currentUser = await authService.getMe();
                set({ user: currentUser });
              } catch (error) {
                // Token invalid, clear auth
                get().logout();
              }
            }
          } catch (error) {
            console.error('Auth initialization error:', error);
          }
        },

        // Register
        register: async (userData) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.register(userData);
            
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
            });

            toast.success('Registration successful! Welcome aboard! 🎉');
            return response;
          } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message || 'Registration failed');
            throw error;
          }
        },

        // Login
        login: async (credentials) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.login(credentials);
            
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
            });

            toast.success(`Welcome back, ${response.user.firstName}! 👋`);
            return response;
          } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message || 'Login failed');
            throw error;
          }
        },

        // Logout
        logout: async () => {
          try {
            await authService.logout();
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
            toast.success('Logged out successfully');
          }
        },

        // Update user profile
        updateProfile: async (userId, userData) => {
          set({ isLoading: true, error: null });
          try {
            const response = await authService.getMe(); // Refresh user data
            set({ user: response, isLoading: false });
            storageService.setUser(response);
            toast.success('Profile updated successfully! ✅');
            return response;
          } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message || 'Profile update failed');
            throw error;
          }
        },

        // Update password
        updatePassword: async (currentPassword, newPassword) => {
          set({ isLoading: true, error: null });
          try {
            await authService.updatePassword(currentPassword, newPassword);
            set({ isLoading: false });
            toast.success('Password updated successfully! 🔐');
          } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message || 'Password update failed');
            throw error;
          }
        },

        // Forgot password
        forgotPassword: async (email) => {
          set({ isLoading: true, error: null });
          try {
            await authService.forgotPassword(email);
            set({ isLoading: false });
            toast.success('Password reset email sent! Check your inbox 📧');
          } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message || 'Failed to send reset email');
            throw error;
          }
        },

        // Reset password
        resetPassword: async (token, password) => {
          set({ isLoading: true, error: null });
          try {
            await authService.resetPassword(token, password);
            set({ isLoading: false });
            toast.success('Password reset successful! Please login 🎉');
          } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message || 'Password reset failed');
            throw error;
          }
        },

        // Check if user has role
        hasRole: (roles) => {
          const { user } = get();
          if (!user) return false;
          
          if (Array.isArray(roles)) {
            return roles.includes(user.role);
          }
          return user.role === roles;
        },

        // Check if user is admin
        isAdmin: () => {
          const { user } = get();
          return user?.role === 'admin' || user?.role === 'super_admin';
        },

        // Check if user is trainer
        isTrainer: () => {
          const { user } = get();
          return user?.role === 'trainer' || user?.role === 'admin' || user?.role === 'super_admin';
        },

        // Reset error
        clearError: () => set({ error: null }),
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);
