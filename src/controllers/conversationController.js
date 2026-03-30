import Conversation from "../models/Conversation.js";
import * as notificationService from "../services/notificationService.js";
import {
  findUserByUsernameAndRole,
  listAllCommunicationUsers,
  normalizeRole
} from "../services/userDirectoryService.js";

const sortParticipants = (a, b) =>
  `${a.role}:${a.username}`.localeCompare(`${b.role}:${b.username}`);

const getCurrentParticipant = (conversation, currentUser) =>
  conversation.participants.find(
    (participant) =>
      participant.username === currentUser.username &&
      participant.role === normalizeRole(currentUser.role)
  );

const getUnreadCount = (conversation, currentUser) => {
  const currentParticipant = getCurrentParticipant(conversation, currentUser);
  const lastReadAt = currentParticipant?.lastReadAt
    ? new Date(currentParticipant.lastReadAt)
    : null;

  return conversation.messages.filter((message) => {
    const isFromCurrentUser =
      message.senderUsername === currentUser.username &&
      message.senderRole === normalizeRole(currentUser.role);
    if (isFromCurrentUser) return false;
    if (!lastReadAt) return true;
    return new Date(message.createdAt) > lastReadAt;
  }).length;
};

const sanitizeConversation = (conversationDoc, currentUser) => {
  const conversation = conversationDoc.toObject();
  const otherParticipant = conversation.participants.find(
    (p) => !(p.username === currentUser.username && p.role === normalizeRole(currentUser.role))
  );
  const lastMessage = conversation.messages[conversation.messages.length - 1] || null;

  return {
    _id: conversation._id,
    participants: conversation.participants,
    otherParticipant: otherParticipant || null,
    lastMessage,
    unreadCount: getUnreadCount(conversation, currentUser),
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
};

export const getCommunicationUsers = async (req, res) => {
  try {
    const users = await listAllCommunicationUsers({
      excludeUsername: req.user.username,
      excludeRole: req.user.role
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrGetConversation = async (req, res) => {
  try {
    const { username, role } = req.body;
    if (!username || !role) {
      return res.status(400).json({ message: "username and role are required" });
    }

    const sender = await findUserByUsernameAndRole({
      username: req.user.username,
      role: req.user.role
    });
    const recipient = await findUserByUsernameAndRole({ username, role });

    if (!sender || !recipient) {
      return res.status(404).json({ message: "Participant not found" });
    }

    const participants = [sender, recipient].sort(sortParticipants);

    let conversation = await Conversation.findOne({
      participants: {
        $all: participants.map((participant) => ({
          $elemMatch: {
            username: participant.username,
            role: participant.role
          }
        }))
      }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: participants.map((participant) => ({
          userId: participant._id,
          username: participant.username,
          role: participant.role,
          name: participant.name,
          lastReadAt: null
        })),
        messages: []
      });
    }

    return res.status(201).json(sanitizeConversation(conversation, req.user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: {
        $elemMatch: {
          username: req.user.username,
          role: normalizeRole(req.user.role)
        }
      }
    }).sort({ lastMessageAt: -1 });

    const payload = conversations.map((conversation) =>
      sanitizeConversation(conversation, req.user)
    );
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (participant) =>
        participant.username === req.user.username &&
        participant.role === normalizeRole(req.user.role)
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Not allowed" });
    }

    res.json({
      conversation: sanitizeConversation(conversation, req.user),
      messages: conversation.messages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markConversationAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const currentParticipant = conversation.participants.find(
      (participant) =>
        participant.username === req.user.username &&
        participant.role === normalizeRole(req.user.role)
    );
    if (!currentParticipant) {
      return res.status(403).json({ message: "Not allowed" });
    }

    currentParticipant.lastReadAt = new Date();
    await conversation.save();

    return res.json({
      message: "Conversation marked as read",
      unreadCount: 0
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !String(body).trim()) {
      return res.status(400).json({ message: "Message body is required" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const sender = conversation.participants.find(
      (participant) =>
        participant.username === req.user.username &&
        participant.role === normalizeRole(req.user.role)
    );
    if (!sender) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const recipient = conversation.participants.find(
      (participant) => participant.username !== sender.username || participant.role !== sender.role
    );

    const message = {
      senderUserId: sender.userId,
      senderUsername: sender.username,
      senderRole: sender.role,
      body: String(body).trim(),
      createdAt: new Date()
    };

    conversation.messages.push(message);
    conversation.lastMessageAt = new Date();
    await conversation.save();

    if (recipient?.userId) {
      await notificationService.sendNotification({
        userId: recipient.userId,
        eventType: "NEW_MESSAGE",
        channel: "INAPP",
        subject: "New message",
        message: `${sender.username} sent you a message`,
        priority: "NORMAL",
        metadata: {
          conversationId: conversation._id,
          senderUsername: sender.username
        }
      });
    }

    const latestMessage = conversation.messages[conversation.messages.length - 1];
    return res.status(201).json(latestMessage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const isConversationParticipant = (conversation, user) =>
  conversation.participants.some(
    (participant) =>
      participant.username === user.username &&
      participant.role === normalizeRole(user.role)
  );

const refreshLastMessageAt = (conversation) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  conversation.lastMessageAt = lastMessage?.createdAt || new Date();
};

export const updateMessage = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !String(body).trim()) {
      return res.status(400).json({ message: "Message body is required" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!isConversationParticipant(conversation, req.user)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const message = conversation.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const isOwner =
      message.senderUsername === req.user.username &&
      message.senderRole === normalizeRole(req.user.role);
    if (!isOwner) {
      return res.status(403).json({ message: "Only sender can edit this message" });
    }

    message.body = String(body).trim();
    message.editedAt = new Date();
    await conversation.save();

    return res.json(message);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!isConversationParticipant(conversation, req.user)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const message = conversation.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const isOwner =
      message.senderUsername === req.user.username &&
      message.senderRole === normalizeRole(req.user.role);
    if (!isOwner) {
      return res.status(403).json({ message: "Only sender can delete this message" });
    }

    message.deleteOne();
    refreshLastMessageAt(conversation);
    await conversation.save();

    return res.json({
      message: "Message deleted",
      conversationId: conversation._id,
      messageId: req.params.messageId
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
