const express = require('express');
const {
  register,
  login,
  getMe,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

// Role-authorization test endpoints
router.get('/test-student', protect, authorize('student'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Access granted to Student: ${req.user.name}`,
    user: req.user,
  });
});

router.get('/test-supervisor', protect, authorize('supervisor'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Access granted to Supervisor: ${req.user.name}`,
    user: req.user,
  });
});

router.get('/test-admin', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Access granted to Admin: ${req.user.name}`,
    user: req.user,
  });
});

module.exports = router;
