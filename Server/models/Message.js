const mongoose = require('mongoose');

/**
 * Message — chat messages between superadmin and admins.
 * Real-time via Socket.IO, persisted for history.
 */
const messageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    messageType: {
      type: String,
      enum: ['text', 'system'],
      default: 'text',
    },
  },
  { timestamps: true }
);

// Index for chat queries
messageSchema.index({ from: 1, to: 1, createdAt: -1 });
messageSchema.index({ to: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);