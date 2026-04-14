const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/protect');
const {
  getConversations, getMessages, sendMessage, getUnreadCount, getChatUsers
} = require('../controllers/chat.controller');

// All chat routes require authentication
router.use(protect);

router.get('/conversations', getConversations);
router.get('/users', getChatUsers);
router.get('/messages/:userId', getMessages);
router.get('/unread-count', getUnreadCount);

router.post('/send', [
  body('to').isMongoId().withMessage('Valid recipient ID is required'),
  body('content').trim().notEmpty().withMessage('Message content is required')
    .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters')
], validate, sendMessage);

module.exports = router;