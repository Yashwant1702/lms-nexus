import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { notificationService } from '@services/notificationService';
import { socketService } from '@services/socketService';
import toast from 'react-hot-toast';

export const useNotificationStore = create(
  devtools((set, get) => ({
    // State
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    filters: {
      type: '',
      isRead: null,
    },

    // Actions
    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    setNotifications: (notifications) => set({ notifications }),

    setUnreadCount: (count) => set({ unreadCount: count }),

    setFilters: (filters) => set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

    // Initialize socket listeners
    initializeSocketListeners: () => {
      // Listen for new notifications
      socketService.onNotification((notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));

        // Show toast notification
        toast.success(notification.title, {
          duration: 5000,
          icon: '🔔',
        });
      });

      // Listen for notification read events
      socketService.onNotificationRead((data) => {
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif._id === data.notificationId
              ? { ...notif, isRead: true }
              : notif
          ),
        }));
      });
    },

    // Fetch notifications
    fetchNotifications: async (params = {}) => {
      set({ isLoading: true, error: null });
      try {
        const { filters } = get();
        const queryParams = { ...filters, ...params };

        const response = await notificationService.getNotifications(queryParams);
        
        set({
          notifications: response.notifications,
          isLoading: false,
        });

        return response;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        console.error('Failed to fetch notifications:', error);
        throw error;
      }
    },

    // Fetch unread count
    fetchUnreadCount: async () => {
      try {
        const response = await notificationService.getUnreadCount();
        set({ unreadCount: response.count });
        return response.count;
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    },

    // Mark as read
    markAsRead: async (id) => {
      try {
        await notificationService.markAsRead(id);
        
        set((state) => ({
          notifications: state.notifications.map((notif) =>
            notif._id === id ? { ...notif, isRead: true, readAt: new Date() } : notif
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      } catch (error) {
        console.error('Failed to mark as read:', error);
        throw error;
      }
    },

    // Mark all as read
    markAllAsRead: async () => {
      set({ isLoading: true, error: null });
      try {
        await notificationService.markAllAsRead();
        
        set((state) => ({
          notifications: state.notifications.map((notif) => ({
            ...notif,
            isRead: true,
            readAt: new Date(),
          })),
          unreadCount: 0,
          isLoading: false,
        }));

        toast.success('All notifications marked as read ✅');
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to mark all as read');
        throw error;
      }
    },

    // Delete notification
    deleteNotification: async (id) => {
      try {
        await notificationService.deleteNotification(id);
        
        set((state) => {
          const notification = state.notifications.find((n) => n._id === id);
          const wasUnread = notification && !notification.isRead;

          return {
            notifications: state.notifications.filter((notif) => notif._id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        });

        toast.success('Notification deleted');
      } catch (error) {
        toast.error(error.message || 'Failed to delete notification');
        throw error;
      }
    },

    // Clear read notifications
    clearReadNotifications: async () => {
      set({ isLoading: true, error: null });
      try {
        await notificationService.clearReadNotifications();
        
        set((state) => ({
          notifications: state.notifications.filter((notif) => !notif.isRead),
          isLoading: false,
        }));

        toast.success('Read notifications cleared 🧹');
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to clear notifications');
        throw error;
      }
    },

    // Filter by type
    filterByType: async (type) => {
      set((state) => ({
        filters: { ...state.filters, type },
      }));
      await get().fetchNotifications();
    },

    // Filter by read status
    filterByReadStatus: async (isRead) => {
      set((state) => ({
        filters: { ...state.filters, isRead },
      }));
      await get().fetchNotifications();
    },

    // Reset filters
    resetFilters: () => {
      set({
        filters: {
          type: '',
          isRead: null,
        },
      });
      get().fetchNotifications();
    },

    // Add notification (for real-time updates)
    addNotification: (notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    },

    // Clear error
    clearError: () => set({ error: null }),
  }))
);
