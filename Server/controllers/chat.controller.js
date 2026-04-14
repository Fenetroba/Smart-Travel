const Message = require('../models/Message');
const User = require('../models/User');

/**
 * GET /api/chat/conversations
 * Get list of users the current user has chatted with.
 */
async function getConversations(req, res, next) {
  try {
    const userId = req.user._id;
    
    // Find all unique users this user has chatted with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ from: userId }, { to: userId }]
        }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$from', userId] },
              then: '$to',
              else: '$from'
            }
          },
          lastMessage: { $last: '$content' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: {
                if: { $and: [{ $eq: ['$to', userId] }, { $eq: ['$isRead', false] }] },
                then: 1,
                else: 0
              }
            }
          }
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ]);

    // Populate user details
    const populatedConversations = await User.populate(conversations, {
      path: '_id',
      select: 'name email role isActive'
    });

    res.json({ success: true, data: populatedConversations });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/messages/:userId
 * Get chat history between current user and specified user.
 */
async function getMessages(req, res, next) {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: otherUserId },
        { from: otherUserId, to: currentUserId }
      ]
    })
    .populate('from', 'name email role')
    .populate('to', 'name email role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

    // Mark messages as read
    await Message.updateMany(
      { from: otherUserId, to: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/send
 * Send a message (also emitted via Socket.IO).
 */
async function sendMessage(req, res, next) {
  try {
    const { to, content } = req.body;
    const from = req.user._id;

    // Validate recipient exists
    const recipient = await User.findById(to);
    if (!recipient || !recipient.isActive) {
      return res.status(404).json({ success: false, message: 'Recipient not found or inactive' });
    }

    const message = await Message.create({ from, to, content });
    const populatedMessage = await Message.findById(message._id)
      .populate('from', 'name email role')
      .populate('to', 'name email role');

    // Emit via Socket.IO if available
    if (req.io) {
      req.io.to(`user_${to}`).emit('newMessage', populatedMessage);
    }

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/unread-count
 * Get count of unread messages for current user.
 */
async function getUnreadCount(req, res, next) {
  try {
    const count = await Message.countDocuments({
      to: req.user._id,
      isRead: false
    });
    
    res.json({ success: true, count });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/users
 * Get list of all active admin users for starting new conversations.
 */
async function getChatUsers(req, res, next) {
  try {
    // Get all active admin users except the current user
    const users = await User.find({
      _id: { $ne: req.user._id },
      isActive: true
    }).select('name email role').sort({ name: 1 });

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

module.exports = { getConversations, getMessages, sendMessage, getUnreadCount, getChatUsers };