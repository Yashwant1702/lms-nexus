// Socket.io configuration and event handlers

// Socket.io configuration options
exports.socketConfig = {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6, // 1MB
  transports: ['websocket', 'polling'],
  allowEIO3: true
};

// Socket namespaces
exports.namespaces = {
  main: '/',
  chat: '/chat',
  notifications: '/notifications',
  courses: '/courses'
};

// Socket events
exports.socketEvents = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // User events
  USER_JOIN: 'join',
  USER_LEAVE: 'leave',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',

  // Chat events
  JOIN_CHAT: 'join-chat',
  LEAVE_CHAT: 'leave-chat',
  SEND_MESSAGE: 'send-message',
  RECEIVE_MESSAGE: 'receive-message',
  TYPING: 'typing',
  USER_TYPING: 'user-typing',
  STOP_TYPING: 'stop-typing',
  MESSAGE_READ: 'message-read',

  // Notification events
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification-read',
  NOTIFICATION_DELETED: 'notification-deleted',

  // Course events
  COURSE_UPDATE: 'course-update',
  COURSE_UPDATED: 'course-updated',
  LESSON_COMPLETE: 'lesson-complete',
  MODULE_COMPLETE: 'module-complete',

  // Assessment events
  ASSESSMENT_STARTED: 'assessment-started',
  ASSESSMENT_SUBMITTED: 'assessment-submitted',
  ASSESSMENT_TIMER: 'assessment-timer',

  // Real-time updates
  PROGRESS_UPDATE: 'progress-update',
  LEADERBOARD_UPDATE: 'leaderboard-update',
  BADGE_EARNED: 'badge-earned'
};

// Room naming conventions
exports.getRoomName = {
  user: (userId) => `user:${userId}`,
  chat: (chatId) => `chat:${chatId}`,
  course: (courseId) => `course:${courseId}`,
  organization: (orgId) => `org:${orgId}`
};

// Connected users tracking
const connectedUsers = new Map();

exports.addConnectedUser = (socketId, userId) => {
  connectedUsers.set(socketId, userId);
};

exports.removeConnectedUser = (socketId) => {
  connectedUsers.delete(socketId);
};

exports.getConnectedUser = (socketId) => {
  return connectedUsers.get(socketId);
};

exports.isUserConnected = (userId) => {
  return Array.from(connectedUsers.values()).includes(userId);
};

exports.getConnectedUsers = () => {
  return Array.from(connectedUsers.values());
};

// Socket middleware for authentication
exports.socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;

  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }

  try {
    const { verifyToken } = require('./jwt');
    const decoded = verifyToken(token);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

module.exports = exports;
