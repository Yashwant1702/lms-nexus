const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
exports.getUserChats = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = {
      'participants.user': req.user.id,
      isActive: true
    };

    if (type) filter.conversationType = type;

    const chats = await Chat.find(filter)
      .populate('participants.user', 'firstName lastName avatar')
      .populate('lastMessage.sender', 'firstName lastName')
      .sort({ 'lastMessage.sentAt': -1 });

    // Get unread message counts
    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const participant = chat.participants.find(
          p => p.user._id.toString() === req.user.id
        );

        const unreadCount = await ChatMessage.countDocuments({
          chat: chat._id,
          createdAt: { $gt: participant.lastReadAt },
          sender: { $ne: req.user.id }
        });

        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: { chats: chatsWithUnread }
    });

  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chats',
      error: error.message
    });
  }
};

// @desc    Create or get direct chat
// @route   POST /api/chat/direct
// @access  Private
exports.createDirectChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself'
      });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      conversationType: 'direct',
      'participants.user': { $all: [req.user.id, userId] }
    })
      .populate('participants.user', 'firstName lastName avatar');

    if (existingChat) {
      return res.status(200).json({
        success: true,
        data: { chat: existingChat }
      });
    }

    // Create new chat
    const chat = await Chat.create({
      conversationType: 'direct',
      participants: [
        { user: req.user.id, role: 'member' },
        { user: userId, role: 'member' }
      ]
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants.user', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: { chat: populatedChat }
    });

  } catch (error) {
    console.error('Create direct chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chat',
      error: error.message
    });
  }
};

// @desc    Create group chat
// @route   POST /api/chat/group
// @access  Private
exports.createGroupChat = async (req, res) => {
  try {
    const { name, description, userIds } = req.body;

    if (!userIds || userIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Group chat must have at least 2 participants'
      });
    }

    // Add creator as admin
    const participants = [
      { user: req.user.id, role: 'admin' },
      ...userIds.map(id => ({ user: id, role: 'member' }))
    ];

    const chat = await Chat.create({
      conversationType: 'group',
      name,
      description,
      participants
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('participants.user', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Group chat created successfully',
      data: { chat: populatedChat }
    });

  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating group chat',
      error: error.message
    });
  }
};

// @desc    Get chat by ID
// @route   GET /api/chat/:chatId
// @access  Private
exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate('participants.user', 'firstName lastName avatar');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.user._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    res.status(200).json({
      success: true,
      data: { chat }
    });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat',
      error: error.message
    });
  }
};

// @desc    Get chat messages
// @route   GET /api/chat/:chatId/messages
// @access  Private
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await ChatMessage.find({
      chat: chatId,
      isDeleted: false
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChatMessage.countDocuments({
      chat: chatId,
      isDeleted: false
    });

    // Update last read
    await Chat.updateOne(
      { _id: chatId, 'participants.user': req.user.id },
      { $set: { 'participants.$.lastReadAt': new Date() } }
    );

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/:chatId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, messageType = 'text', replyTo, attachment } = req.body;

    // Verify user is participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const isParticipant = chat.participants.some(
      p => p.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    // Create message
    const message = await ChatMessage.create({
      chat: chatId,
      sender: req.user.id,
      messageType,
      content,
      replyTo,
      attachment
    });

    // Update chat's last message
    chat.lastMessage = {
      text: content,
      sender: req.user.id,
      sentAt: new Date()
    };
    await chat.save();

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate('sender', 'firstName lastName avatar')
      .populate('replyTo', 'content sender');

    // Emit real-time event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(chatId).emit('newMessage', populatedMessage);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: populatedMessage }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// @desc    Edit message
// @route   PUT /api/chat/messages/:messageId
// @access  Private
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await ChatMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check permission
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this message'
      });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(message.chat.toString()).emit('messageEdited', message);
    }

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error editing message',
      error: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check permission
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message has been deleted';
    await message.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(message.chat.toString()).emit('messageDeleted', { messageId });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

// @desc    Add reaction to message
// @route   POST /api/chat/messages/:messageId/react
// @access  Private
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await ChatMessage.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      r => r.user.toString() === req.user.id && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(
        r => !(r.user.toString() === req.user.id && r.emoji === emoji)
      );
    } else {
      // Add reaction
      message.reactions.push({
        user: req.user.id,
        emoji
      });
    }

    await message.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(message.chat.toString()).emit('messageReaction', {
        messageId,
        reactions: message.reactions
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reaction updated successfully',
      data: { reactions: message.reactions }
    });

  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating reaction',
      error: error.message
    });
  }
};

// @desc    Leave chat
// @route   POST /api/chat/:chatId/leave
// @access  Private
exports.leaveChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Remove user from participants
    chat.participants = chat.participants.filter(
      p => p.user.toString() !== req.user.id
    );

    // If no participants left, archive the chat
    if (chat.participants.length === 0) {
      chat.isActive = false;
      chat.archivedAt = new Date();
    }

    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Left chat successfully'
    });

  } catch (error) {
    console.error('Leave chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving chat',
      error: error.message
    });
  }
};

module.exports = exports;
