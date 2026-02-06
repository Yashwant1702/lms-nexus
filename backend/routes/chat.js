const express = require('express');
const router = express.Router();
const {
  getUserChats,
  createDirectChat,
  createGroupChat,
  getChatById,
  getChatMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  leaveChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const {
  createDirectChatValidation,
  createGroupChatValidation,
  sendMessageValidation,
  mongoIdValidation,
  validate
} = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Get user's chats
router.get('/', getUserChats);

// Create direct chat
router.post('/direct', createDirectChatValidation, validate, createDirectChat);

// Create group chat
router.post('/group', createGroupChatValidation, validate, createGroupChat);

// Get chat by ID
router.get('/:chatId', mongoIdValidation, validate, getChatById);

// Get chat messages
router.get('/:chatId/messages', mongoIdValidation, validate, getChatMessages);

// Send message
router.post('/:chatId/messages', sendMessageValidation, validate, sendMessage);

// Edit message
router.put('/messages/:messageId', mongoIdValidation, validate, editMessage);

// Delete message
router.delete('/messages/:messageId', mongoIdValidation, validate, deleteMessage);

// Add/Remove reaction
router.post('/messages/:messageId/react', mongoIdValidation, validate, addReaction);

// Leave chat
router.post('/:chatId/leave', mongoIdValidation, validate, leaveChat);

module.exports = router;
