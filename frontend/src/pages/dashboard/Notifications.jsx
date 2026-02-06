import React, { useEffect } from 'react';
import { useNotifications } from '@hooks/useNotifications';
import { Bell, Check, Trash2, CheckCheck, Inbox, X } from 'lucide-react';
import {
  Card,
  Loading,
  EmptyState,
  Button,
  Badge,
  Tabs,
} from '@components/common';
import { formatDate } from '@utils/helpers';
import { NOTIFICATION_TYPE_ICONS } from '@utils/constants';

const Notifications = () => {
  const {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const tabs = [
    {
      label: (
        <span className="flex items-center gap-2">
          All
          {unreadCount > 0 && (
            <Badge variant="danger" size="sm">
              {unreadCount}
            </Badge>
          )}
        </span>
      ),
      content: (
        <NotificationsList
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      ),
    },
    {
      label: `Unread (${unreadCount})`,
      content: (
        <NotificationsList
          notifications={unreadNotifications}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      ),
    },
    {
      label: 'Read',
      content: (
        <NotificationsList
          notifications={readNotifications}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      ),
    },
  ];

  if (isLoading) {
    return <Loading text="Loading notifications..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary-500" />
            Notifications
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount} unread
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
          {readNotifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearReadNotifications}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear read
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No notifications"
          description="You're all caught up!"
        />
      ) : (
        <Card>
          <Tabs tabs={tabs} />
        </Card>
      )}
    </div>
  );
};

const NotificationsList = ({ notifications, onMarkAsRead, onDelete }) => {
  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        No notifications
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const icon = NOTIFICATION_TYPE_ICONS[notification.type] || '📢';

  return (
    <div
      className={`p-4 border rounded-lg ${
        notification.isRead
          ? 'border-gray-200 dark:border-gray-700'
          : 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {notification.title}
            </h3>
            {!notification.isRead && (
              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(notification.createdAt, 'relative')}
            </p>
            <div className="flex items-center gap-2">
              {!notification.isRead && (
                <button
                  onClick={() => onMarkAsRead(notification._id)}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <Check className="w-3 h-3 inline mr-1" />
                  Mark read
                </button>
              )}
              <button
                onClick={() => onDelete(notification._id)}
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
