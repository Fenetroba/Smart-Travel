const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/protect');
const { trackEvent, getDashboardData } = require('../controllers/analytics.controller');

// Public endpoint for tracking events
router.post('/track', [
  body('eventType').isIn(['route_search', 'recommendation_request', 'transport_analysis', 'page_visit', 'user_session'])
    .withMessage('Invalid event type'),
  body('data').optional().isObject().withMessage('Data must be an object')
], validate, trackEvent);

// Protected endpoint for getting analytics data
router.get('/dashboard', protect, getDashboardData);

module.exports = router;