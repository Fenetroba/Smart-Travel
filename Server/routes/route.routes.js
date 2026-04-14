const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { calculate } = require('../controllers/route.controller');
const { validate } = require('../middleware/validate');

router.post(
  '/calculate',
  [
    body('start').trim().notEmpty().withMessage('start is required'),
    body('destination').trim().notEmpty().withMessage('destination is required'),
  ],
  validate,
  calculate
);

module.exports = router;
