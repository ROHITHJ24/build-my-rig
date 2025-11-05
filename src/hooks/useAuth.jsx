import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authAPI.login(credentials);

          if (response.success) {
            const { token, user } = response.data;

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // Store token in localStorage for axios interceptor
            localStorage.setItem('token', token);

            return { success: true, user };
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null
          });

          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authAPI.register(userData);

          if (response.success) {
            const { token, user } = response.data;

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // Store token in localStorage for axios interceptor
            localStorage.setItem('token', token);

            return { success: true, user };
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null
          });

          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          // Call logout endpoint (optional, as logout is mainly client-side)
          await authAPI.logout().catch(() => {
            // Ignore errors during logout
          });

          // Clear state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });

          // Clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        } catch (error) {
          // Even if API call fails, clear local state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });

          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      },

      updateProfile: async (userData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authAPI.updateProfile(userData);

          if (response.success) {
            const { user } = response.data;

            set({
              user,
              isLoading: false,
              error: null
            });

            return { success: true, user };
          } else {
            throw new Error(response.message || 'Profile update failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Profile update failed';
          set({
            isLoading: false,
            error: errorMessage
          });

          return { success: false, error: errorMessage };
        }
      },

      changePassword: async (passwordData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authAPI.changePassword(passwordData);

          if (response.success) {
            set({ isLoading: false, error: null });
            return { success: true };
          } else {
            throw new Error(response.message || 'Password change failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Password change failed';
          set({
            isLoading: false,
            error: errorMessage
          });

          return { success: false, error: errorMessage };
        }
      },

      forgotPassword: async (email) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authAPI.forgotPassword(email);

          if (response.success) {
            set({ isLoading: false, error: null });
            return { success: true };
          } else {
            throw new Error(response.message || 'Password reset failed');
          }
        } catch (error) {
          const errorMessage = error.message || 'Password reset failed';
          set({
            isLoading: false,
            error: errorMessage
          });

          return { success: false, error: errorMessage };
        }
      },

      refreshAuth: async () => {
        try {
          const { token } = get();
          if (!token) return false;

          const response = await authAPI.getProfile();

          if (response.success) {
            set({
              user: response.data.user,
              isAuthenticated: true
            });
            return true;
          } else {
            // Token is invalid, logout user
            get().logout();
            return false;
          }
        } catch (error) {
          // Token is invalid, logout user
          get().logout();
          return false;
        }
      },

      clearError: () => set({ error: null }),

      // Check if user is authenticated on app load
      checkAuth: () => {
        const { token, refreshToken } = get();

        if (token && refreshToken) {
          // Set token in localStorage for axios interceptor
          localStorage.setItem('token', token);

          // Verify token is still valid
          get().refreshAuth();
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Hook for accessing auth state and actions
export const useAuth = () => {
  const store = useAuthStore();

  return {
    // State
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // Computed values
    isAdmin: store.user?.role === 'admin',
    fullName: store.user ? `${store.user.firstName} ${store.user.lastName}` : '',
    email: store.user?.email,
    userId: store.user?.id,

    // Actions
    login: store.login,
    register: store.register,
    logout: store.logout,
    updateProfile: store.updateProfile,
    changePassword: store.changePassword,
    forgotPassword: store.forgotPassword,
    refreshAuth: store.refreshAuth,
    clearError: store.clearError,
    checkAuth: store.checkAuth
  };
};

export default useAuth;