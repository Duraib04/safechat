const express = require('express');
const authMiddleware = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { encryptMessage, decryptMessage } = require('../utils/encryption');

const router = express.Router();

// Get conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId,
    })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users
router.get('/messages/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId },
      ],
      deletedBy: { $ne: req.userId },
    })
      .populate('sender', '-password')
      .populate('recipient', '-password')
      .sort({ createdAt: 1 });

    // Decrypt messages
    const decryptedMessages = messages.map((msg) => ({
      ...msg.toObject(),
      content: decryptMessage(msg.encryptedContent) || '[Encrypted message]',
    }));

    res.json(decryptedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }

    // Check if users are not blocking each other
    const sender = await User.findById(req.userId);
    const recipient = await User.findById(recipientId);

    if (!sender || !recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (sender.blockedUsers.includes(recipientId) || recipient.blockedUsers.includes(req.userId)) {
      return res.status(403).json({ message: 'Cannot send message to this user' });
    }

    // Encrypt message
    const encryptedContent = encryptMessage(content);

    // Create message
    const message = new Message({
      sender: req.userId,
      recipient: recipientId,
      content,
      encryptedContent,
    });

    await message.save();
    await message.populate('sender', '-password');
    await message.populate('recipient', '-password');

    // Update or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.userId, recipientId],
        lastMessage: message._id,
        lastMessageTime: message.createdAt,
      });
    } else {
      conversation.lastMessage = message._id;
      conversation.lastMessageTime = message.createdAt;
    }

    await conversation.save();

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        ...message.toObject(),
        content,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark message as read
router.put('/messages/:messageId/read', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.recipient.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/messages/:messageId', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (
      message.sender.toString() !== req.userId &&
      message.recipient.toString() !== req.userId
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!message.deletedBy.includes(req.userId)) {
      message.deletedBy.push(req.userId);
      await message.save();
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
