import { useNotificationStore } from '@store/notificationStore';
import { useEffect } from 'react';

export const useNotifications = (autoFetch = true) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    filters,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    filterByType,
    filterByReadStatus,
    resetFilters,
    addNotification,
    initializeSocketListeners,
    clearError,
  } = useNotificationStore();

  // Initialize socket listeners and fetch data on mount
  useEffect(() => {
    initializeSocketListeners();
    
    if (autoFetch) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [autoFetch]);

  // Get unread notifications
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  // Get read notifications
  const readNotifications = notifications.filter((n) => n.isRead);

  // Mark as read and fetch updated count
  const markAsReadAndUpdate = async (id) => {
    await markAsRead(id);
    await fetchUnreadCount();
  };

  // Mark all as read and fetch updated count
  const markAllAsReadAndUpdate = async () => {
    await markAllAsRead();
    await fetchUnreadCount();
  };

  return {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
    error,
    filters,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead: markAsReadAndUpdate,
    markAllAsRead: markAllAsReadAndUpdate,
    deleteNotification,
    clearReadNotifications,
    filterByType,
    filterByReadStatus,
    resetFilters,
    addNotification,
    clearError,
  };
};
