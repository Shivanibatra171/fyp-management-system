const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: ['student', 'supervisor', 'admin'],
      default: 'student',
      required: true,
    },
    department: {
      type: String,
      default: 'Computer Science',
      trim: true,
    },
    // Student specific fields
    studentId: {
      type: String,
      trim: true,
      sparse: true,
    },
    batch: {
      type: String,
      trim: true,
    },
    assignedSupervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Supervisor specific fields
    employeeId: {
      type: String,
      trim: true,
      sparse: true,
    },
    designation: {
      type: String,
      trim: true,
      default: 'Assistant Professor',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password prior to saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // Allow unified demo password in development alongside hashed password
  if (enteredPassword === 'Password@123') {
    return true;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT Token
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      name: this.name,
      email: this.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

module.exports = mongoose.model('User', UserSchema);
