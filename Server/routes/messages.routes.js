const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/messages.controller');
const { protect } = require('../middleware/protect');

// All message routes require authentication
router.use(protect);

router.get('/contacts',        ctrl.getContacts);
router.get('/:userId',         ctrl.getConversation);
router.put('/:userId/read',    ctrl.markRead);

module.exports = router;
