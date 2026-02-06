import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { chatService } from '@services/chatService';
import { socketService } from '@services/socketService';
import toast from 'react-hot-toast';

export const useChatStore = create(
  devtools((set, get) => ({
    // State
    chats: [],
    currentChat: null,
    messages: [],
    isLoading: false,
    error: null,
    typingUsers: new Set(),

    // Actions
    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    setChats: (chats) => set({ chats }),

    setCurrentChat: (chat) => set({ currentChat: chat }),

    setMessages: (messages) => set({ messages }),

    // Initialize socket listeners
    initializeSocketListeners: () => {
      // Listen for new messages
      socketService.onMessageReceived((message) => {
        const { currentChat } = get();
        
        if (currentChat && message.chat === currentChat._id) {
          set((state) => ({
            messages: [...state.messages, message],
          }));
        }

        // Update chat list
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat._id === message.chat
              ? { ...chat, lastMessage: message, updatedAt: new Date() }
              : chat
          ),
        }));
      });

      // Listen for typing indicators
      socketService.onUserTyping(({ userId, isTyping }) => {
        set((state) => {
          const newTypingUsers = new Set(state.typingUsers);
          if (isTyping) {
            newTypingUsers.add(userId);
          } else {
            newTypingUsers.delete(userId);
          }
          return { typingUsers: newTypingUsers };
        });
      });
    },

    // Fetch chats
    fetchChats: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await chatService.getMyChats();
        set({ chats: response.chats, isLoading: false });
        return response;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to fetch chats');
        throw error;
      }
    },

    // Create direct chat
    createDirectChat: async (userId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await chatService.createDirectChat(userId);
        
        set((state) => ({
          chats: [response.chat, ...state.chats],
          currentChat: response.chat,
          isLoading: false,
        }));

        return response.chat;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to create chat');
        throw error;
      }
    },

    // Create group chat
    createGroupChat: async (name, userIds) => {
      set({ isLoading: true, error: null });
      try {
        const response = await chatService.createGroupChat(name, userIds);
        
        set((state) => ({
          chats: [response.chat, ...state.chats],
          currentChat: response.chat,
          isLoading: false,
        }));

        toast.success('Group chat created! 👥');
        return response.chat;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to create group chat');
        throw error;
      }
    },

    // Select chat
    selectChat: async (chatId) => {
      set({ isLoading: true, error: null });
      try {
        const [chatResponse, messagesResponse] = await Promise.all([
          chatService.getChatById(chatId),
          chatService.getChatMessages(chatId),
        ]);

        set({
          currentChat: chatResponse.chat,
          messages: messagesResponse.messages,
          isLoading: false,
        });

        // Join chat room via socket
        socketService.joinChat(chatId);

        return chatResponse.chat;
      } catch (error) {
        set({ error: error.message, isLoading: false });
        toast.error(error.message || 'Failed to load chat');
        throw error;
      }
    },

    // Send message
    sendMessage: async (content, messageType = 'text') => {
      const { currentChat } = get();
      if (!currentChat) return;

      try {
        const response = await chatService.sendMessage(
          currentChat._id,
          content,
          messageType
        );

        set((state) => ({
          messages: [...state.messages, response.message],
        }));

        // Emit via socket for real-time
        socketService.sendMessage(currentChat._id, response.message);

        return response.message;
      } catch (error) {
        toast.error(error.message || 'Failed to send message');
        throw error;
      }
    },

    // Edit message
    editMessage: async (messageId, content) => {
      try {
        const response = await chatService.editMessage(messageId, content);
        
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === messageId ? response.message : msg
          ),
        }));

        return response.message;
      } catch (error) {
        toast.error(error.message || 'Failed to edit message');
        throw error;
      }
    },

    // Delete message
    deleteMessage: async (messageId) => {
      try {
        await chatService.deleteMessage(messageId);
        
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== messageId),
        }));

        toast.success('Message deleted');
      } catch (error) {
        toast.error(error.message || 'Failed to delete message');
        throw error;
      }
    },

    // Emit typing indicator
    emitTyping: (isTyping) => {
      const { currentChat } = get();
      const userId = get().currentUserId; // You'll need to add this from auth
      
      if (currentChat && userId) {
        socketService.emitTyping(currentChat._id, userId, isTyping);
      }
    },

    // Leave chat
    leaveChat: () => {
      const { currentChat } = get();
      
      if (currentChat) {
        socketService.leaveChat(currentChat._id);
      }
      
      set({
        currentChat: null,
        messages: [],
        typingUsers: new Set(),
      });
    },

    // Clear error
    clearError: () => set({ error: null }),
  }))
);
