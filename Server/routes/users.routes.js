const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/users.controller');
const { protect, requireRole } = require('../middleware/protect');
const { validate } = require('../middleware/validate');

// All routes require superadmin
router.use(protect, requireRole('superadmin'));

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'superadmin']).withMessage('Role must be admin or superadmin')
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['admin', 'superadmin']).withMessage('Role must be admin or superadmin'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
  ],
  validate,
  ctrl.update
);

router.put('/:id/toggle-active', ctrl.toggleActive);
router.delete('/:id', ctrl.remove);

module.exports = router;
