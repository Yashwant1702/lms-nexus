import { io } from 'socket.io-client';
import { storageService } from './storageService';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Connect to socket server
  connect(userId) {
    if (this.socket?.connected) {
      return;
    }

    const token = storageService.getToken();
    
    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      
      // Join user's room
      if (userId) {
        this.socket.emit('join', userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Emit event
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Listen to event
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    }
  }

  // Chat specific methods
  joinChat(chatId) {
    this.emit('join-chat', chatId);
  }

  leaveChat(chatId) {
    this.emit('leave-chat', chatId);
  }

  sendMessage(chatId, message) {
    this.emit('send-message', { chatId, message });
  }

  onMessageReceived(callback) {
    this.on('receive-message', callback);
  }

  emitTyping(chatId, userId, isTyping) {
    this.emit('typing', { chatId, userId, isTyping });
  }

  onUserTyping(callback) {
    this.on('user-typing', callback);
  }

  // Notification specific methods
  onNotification(callback) {
    this.on('notification', callback);
  }

  onNotificationRead(callback) {
    this.on('notification-read', callback);
  }

  // Course specific methods
  onCourseUpdate(callback) {
    this.on('course-updated', callback);
  }

  // Assessment specific methods
  onAssessmentTimer(callback) {
    this.on('assessment-timer', callback);
  }

  // Gamification specific methods
  onBadgeEarned(callback) {
    this.on('badge-earned', callback);
  }

  onLeaderboardUpdate(callback) {
    this.on('leaderboard-update', callback);
  }
}

// Create singleton instance
export const socketService = new SocketService();
