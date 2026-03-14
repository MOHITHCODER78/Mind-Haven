const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

const supportRoles = ['admin', 'counsellor', 'peer_mentor'];

const toEntityId = (entity) => {
  if (!entity) {
    return '';
  }

  if (entity._id) {
    return entity._id.toString();
  }

  return entity.toString();
};

const canAccessConversation = (conversation, user) => {
  if (!conversation || !user) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  if (['counsellor', 'peer_mentor'].includes(user.role)) {
    return (
      conversation.assignedRole === user.role &&
      (!conversation.assignedSupport || toEntityId(conversation.assignedSupport) === user.id)
    );
  }

  return toEntityId(conversation.student) === user.id;
};

const normalizeConversation = (conversation) => ({
  id: conversation._id.toString(),
  topic: conversation.topic,
  assignedRole: conversation.assignedRole,
  assignedSupportName: conversation.assignedSupport?.name || 'Unassigned',
  assignedSupportEmail: conversation.assignedSupport?.email || '',
  assignedSupportStatus: conversation.assignedSupport?.availabilityStatus || 'offline',
  status: conversation.status,
  lastMessageAt: conversation.lastMessageAt,
  lastMessagePreview: conversation.lastMessagePreview || '',
  unreadForStudent: conversation.unreadForStudent || 0,
  unreadForSupport: conversation.unreadForSupport || 0,
  studentName: conversation.student?.name || 'Student',
  studentEmail: conversation.student?.email || '',
});

const pickSupportAssignee = async (assignedRole) => {
  const availableSupport = await User.findOne({ role: assignedRole }).sort({ availabilityStatus: -1, updatedAt: 1 });
  return availableSupport?._id || null;
};

const getConversationQuery = (user) => {
  if (user.role === 'student') {
    return { student: user.id };
  }

  if (user.role === 'admin') {
    return {};
  }

  return {
    assignedRole: user.role,
    $or: [{ assignedSupport: user.id }, { assignedSupport: null }],
  };
};

const markConversationRead = async (conversation, user) => {
  if (user.role === 'student') {
    conversation.unreadForStudent = 0;
  } else if (supportRoles.includes(user.role)) {
    conversation.unreadForSupport = 0;
  }
  await conversation.save();
};

const getConversations = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ conversations: [] });
  }

  const conversations = await ChatConversation.find(getConversationQuery(req.user))
    .populate('student', 'name email')
    .populate('assignedSupport', 'name email availabilityStatus lastSeenAt')
    .sort({ status: -1, lastMessageAt: -1 })
    .lean();

  return res.json({ conversations: conversations.map(normalizeConversation) });
};

const createConversation = async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can start support conversations.' });
  }

  if (!req.body.topic?.trim()) {
    return res.status(400).json({ message: 'Please enter a conversation topic.' });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection required to create a conversation.' });
  }

  const assignedRole = req.body.assignedRole || 'counsellor';
  const assignedSupport = await pickSupportAssignee(assignedRole);

  const conversation = await ChatConversation.create({
    student: req.user.id,
    topic: req.body.topic.trim(),
    assignedRole,
    assignedSupport,
    unreadForSupport: 0,
  });

  const populatedConversation = await ChatConversation.findById(conversation._id)
    .populate('student', 'name email')
    .populate('assignedSupport', 'name email availabilityStatus lastSeenAt');

  return res.status(201).json({
    message: 'Support conversation started.',
    conversation: normalizeConversation(populatedConversation),
  });
};

const getMessages = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json({ messages: [] });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Conversation not found.' });
  }

  const conversation = await ChatConversation.findById(req.params.id)
    .populate('student', 'name email')
    .populate('assignedSupport', 'name email availabilityStatus lastSeenAt');
  if (!canAccessConversation(conversation, req.user)) {
    return res.status(403).json({ message: 'You do not have access to this conversation.' });
  }

  if (!conversation.assignedSupport && ['counsellor', 'peer_mentor'].includes(req.user.role)) {
    conversation.assignedSupport = req.user.id;
    await conversation.save();
    await conversation.populate('assignedSupport', 'name email availabilityStatus lastSeenAt');
  }

  const messages = await ChatMessage.find({ conversation: req.params.id }).sort({ createdAt: 1 }).lean();
  await markConversationRead(conversation, req.user);

  return res.json({
    conversation: normalizeConversation(conversation),
    messages: messages.map((message) => ({
      id: message._id.toString(),
      senderRole: message.senderRole,
      content: message.content,
      createdAt: message.createdAt,
    })),
  });
};

const createMessage = async (req, res) => {
  if (!req.body.content?.trim()) {
    return res.status(400).json({ message: 'Please enter a message.' });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection required to send messages.' });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Conversation not found.' });
  }

  const conversation = await ChatConversation.findById(req.params.id);
  if (!canAccessConversation(conversation, req.user)) {
    return res.status(403).json({ message: 'You do not have access to this conversation.' });
  }

  if (conversation.status === 'closed') {
    return res.status(400).json({ message: 'This conversation is closed. Reopen it to continue messaging.' });
  }

  if (!conversation.assignedSupport && ['counsellor', 'peer_mentor'].includes(req.user.role)) {
    conversation.assignedSupport = req.user.id;
  }

  const message = await ChatMessage.create({
    conversation: conversation._id,
    sender: req.user.id,
    senderRole: req.user.role,
    content: req.body.content.trim(),
  });

  conversation.lastMessageAt = new Date();
  conversation.lastMessagePreview = req.body.content.trim().slice(0, 180);
  if (req.user.role === 'student') {
    conversation.unreadForSupport += 1;
  } else {
    conversation.unreadForStudent += 1;
    conversation.unreadForSupport = 0;
  }
  await conversation.save();

  return res.status(201).json({
    message: 'Message sent.',
    chatMessage: {
      id: message._id.toString(),
      senderRole: message.senderRole,
      content: message.content,
      createdAt: message.createdAt,
    },
    conversation: {
      id: conversation._id.toString(),
      unreadForStudent: conversation.unreadForStudent,
      unreadForSupport: conversation.unreadForSupport,
      status: conversation.status,
    },
  });
};

const updateConversationStatus = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database connection required to update conversation status.' });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Conversation not found.' });
  }

  const { status } = req.body;
  if (!['open', 'closed'].includes(status)) {
    return res.status(400).json({ message: 'Please choose a valid conversation status.' });
  }

  const conversation = await ChatConversation.findById(req.params.id)
    .populate('student', 'name email')
    .populate('assignedSupport', 'name email availabilityStatus lastSeenAt');
  if (!canAccessConversation(conversation, req.user)) {
    return res.status(403).json({ message: 'You do not have access to this conversation.' });
  }

  conversation.status = status;
  conversation.closedByRole = status === 'closed' ? req.user.role : '';
  await conversation.save();

  return res.json({
    message: status === 'closed' ? 'Conversation closed.' : 'Conversation reopened.',
    conversation: normalizeConversation(conversation),
  });
};

const updatePresenceFromToken = async (token, status) => {
  if (!token || mongoose.connection.readyState !== 1) {
    return null;
  }

  try {
    const secret = process.env.JWT_SECRET || 'development-secret';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);
    if (!user) {
      return null;
    }

    user.availabilityStatus = status;
    user.lastSeenAt = new Date();
    await user.save();
    return user;
  } catch (_error) {
    return null;
  }
};

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  createMessage,
  updateConversationStatus,
  updatePresenceFromToken,
};
