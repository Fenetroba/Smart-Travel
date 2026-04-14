/**
 * Socket.io chat handler.
 *
 * Events (client → server):
 *   join          { token }           — authenticate and join personal room
 *   send_message  { receiverId, content } — send a message
 *   mark_read     { senderId }         — mark messages from sender as read
 *   typing        { receiverId }       — notify receiver that user is typing
 *   stop_typing   { receiverId }       — stop typing indicator
 *
 * Events (server → client):
 *   authenticated { user }            — join confirmed
 *   auth_error    { message }         — bad token
 *   receive_message { message }       — new message delivered
 *   messages_read   { by }            — messages marked read
 *   user_typing     { userId, name }  — typing indicator
 *   user_stop_typing { userId }       — stop typing indicator
 *   error           { message }       — general error
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

// Map userId (string) → socket.id for targeted delivery
const onlineUsers = new Map();

function initChat(io) {
  io.on('connection', (socket) => {
    // ── Authentication ──────────────────────────────────────────────────────
    socket.on('join', async ({ token } = {}) => {
      try {
        if (!token) throw new Error('No token');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) throw new Error('User not found');

        // Store mapping and join a personal room named by userId
        socket.userId = user._id.toString();
        socket.userRole = user.role;
        onlineUsers.set(socket.userId, socket.id);
        socket.join(socket.userId);

        socket.emit('authenticated', {
          user: { id: user._id, name: user.name, role: user.role },
        });

        console.log(`[Chat] ${user.name} (${user.role}) connected`);
      } catch (err) {
        socket.emit('auth_error', { message: 'Authentication failed' });
        socket.disconnect(true);
      }
    });

    // ── Send message ────────────────────────────────────────────────────────
    socket.on('send_message', async ({ receiverId, content } = {}) => {
      try {
        if (!socket.userId) return socket.emit('error', { message: 'Not authenticated' });
        if (!receiverId || !content?.trim()) {
          return socket.emit('error', { message: 'receiverId and content are required' });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) return socket.emit('error', { message: 'Receiver not found' });

        // Enforce chat rules: only superadmin ↔ admin conversations
        const sender = await User.findById(socket.userId);
        const validPair =
          (sender.role === 'superadmin' && receiver.role === 'admin') ||
          (sender.role === 'admin' && receiver.role === 'superadmin');

        if (!validPair) {
          return socket.emit('error', { message: 'You can only chat with superadmin/admin' });
        }

        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content: content.trim(),
        });

        const populated = await message.populate([
          { path: 'sender', select: 'name role' },
          { path: 'receiver', select: 'name role' },
        ]);

        // Deliver to receiver's room (if online)
        io.to(receiverId).emit('receive_message', populated);

        // Echo back to sender for confirmation
        socket.emit('receive_message', populated);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── Mark read ───────────────────────────────────────────────────────────
    socket.on('mark_read', async ({ senderId } = {}) => {
      try {
        if (!socket.userId) return;

        await Message.updateMany(
          { sender: senderId, receiver: socket.userId, read: false },
          { read: true }
        );

        // Notify the original sender that their messages were read
        io.to(senderId).emit('messages_read', { by: socket.userId });
      } catch {
        // silent — non-critical
      }
    });

    // ── Typing indicators ───────────────────────────────────────────────────
    socket.on('typing', ({ receiverId } = {}) => {
      if (!socket.userId || !receiverId) return;
      io.to(receiverId).emit('user_typing', { userId: socket.userId });
    });

    socket.on('stop_typing', ({ receiverId } = {}) => {
      if (!socket.userId || !receiverId) return;
      io.to(receiverId).emit('user_stop_typing', { userId: socket.userId });
    });

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        console.log(`[Chat] User ${socket.userId} disconnected`);
      }
    });
  });
}

module.exports = { initChat, onlineUsers };
