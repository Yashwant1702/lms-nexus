import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { storageService } from '@services/storageService';

export const useUIStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        theme: 'light',
        sidebarOpen: true,
        sidebarCollapsed: false,
        modalOpen: false,
        modalContent: null,
        drawerOpen: false,
        drawerContent: null,
        loading: false,
        pageTitle: '',

        // Theme actions
        setTheme: (theme) => {
          set({ theme });
          storageService.setTheme(theme);
        },

        toggleTheme: () => {
          const { theme } = get();
          const newTheme = theme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },

        // Sidebar actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

        toggleSidebarCollapsed: () => 
          set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

        // Modal actions
        openModal: (content) => set({ modalOpen: true, modalContent: content }),

        closeModal: () => set({ modalOpen: false, modalContent: null }),

        // Drawer actions
        openDrawer: (content) => set({ drawerOpen: true, drawerContent: content }),

        closeDrawer: () => set({ drawerOpen: false, drawerContent: null }),

        // Loading actions
        setLoading: (loading) => set({ loading }),

        showLoading: () => set({ loading: true }),

        hideLoading: () => set({ loading: false }),

        // Page title
        setPageTitle: (title) => {
          set({ pageTitle: title });
          document.title = title ? `${title} - LMS Nexus` : 'LMS Nexus';
        },
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    )
  )
);
