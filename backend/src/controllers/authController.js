const { User } = require('../models');

// Helper to format auth response with token
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJwtToken();

  // User payload without sensitive data
  const userPayload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    studentId: user.studentId,
    employeeId: user.employeeId,
    designation: user.designation,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userPayload,
  });
};

// @desc    Register new student
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, studentId, department, batch, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check if email already registered
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Check if studentId already registered (if provided)
    if (studentId) {
      const existingId = await User.findOne({ studentId });
      if (existingId) {
        return res.status(400).json({
          success: false,
          message: 'An account with this Student ID / Roll Number already exists.',
        });
      }
    }

    // Self-registration is strictly for students
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'student',
      studentId: studentId || undefined,
      department: department || 'Computer Science',
      batch: batch || '',
      phone: phone || '',
    });

    sendTokenResponse(user, 201, res, 'Student account registered successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (Student, Supervisor, Admin)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check for user and include password for verification
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
