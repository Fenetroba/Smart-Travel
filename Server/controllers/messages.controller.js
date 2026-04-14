/**
 * Messages controller — REST endpoints for chat history.
 * Real-time delivery is handled by Socket.io (see socket/chat.js).
 */

const Message = require('../models/Message');
const User = require('../models/User');

/**
 * GET /api/messages/:userId
 * Returns the full conversation between the current user and :userId.
 */
async function getConversation(req, res, next) {
  try {
    const me = req.user._id;
    const other = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name role')
      .populate('receiver', 'name role');

    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/messages/contacts
 * Superadmin: returns all admins with their latest message and unread count.
 * Admin: returns the superadmin as the only contact.
 */
async function getContacts(req, res, next) {
  try {
    const me = req.user;

    let contacts;
    if (me.role === 'superadmin') {
      contacts = await User.find({ role: 'admin' }).select('name email role isActive');
    } else {
      contacts = await User.find({ role: 'superadmin' }).select('name email role');
    }

    // Attach unread count for each contact
    const withUnread = await Promise.all(
      contacts.map(async (contact) => {
        const unread = await Message.countDocuments({
          sender: contact._id,
          receiver: me._id,
          read: false,
        });
        return { ...contact.toObject(), unreadCount: unread };
      })
    );

    res.json({ success: true, data: withUnread });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/messages/:userId/read
 * Marks all messages from :userId to the current user as read.
 */
async function markRead(req, res, next) {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getConversation, getContacts, markRead };
