import api from './api';

export const chatService = {
  // Get user's chats
  getMyChats: async () => {
    try {
      const response = await api.get('/chat');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create direct chat
  createDirectChat: async (userId) => {
    try {
      const response = await api.post('/chat/direct', { userId });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Create group chat
  createGroupChat: async (name, userIds) => {
    try {
      const response = await api.post('/chat/group', { name, userIds });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get chat by ID
  getChatById: async (chatId) => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get chat messages
  getChatMessages: async (chatId, params = {}) => {
    try {
      const response = await api.get(`/chat/${chatId}/messages`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Send message
  sendMessage: async (chatId, content, messageType = 'text') => {
    try {
      const response = await api.post(`/chat/${chatId}/messages`, {
        content,
        messageType,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Edit message
  editMessage: async (messageId, content) => {
    try {
      const response = await api.put(`/chat/messages/${messageId}`, { content });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    try {
      const response = await api.delete(`/chat/messages/${messageId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add reaction
  addReaction: async (messageId, emoji) => {
    try {
      const response = await api.post(`/chat/messages/${messageId}/react`, { emoji });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Leave chat
  leaveChat: async (chatId) => {
    try {
      const response = await api.post(`/chat/${chatId}/leave`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
