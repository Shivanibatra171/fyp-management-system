const mongoose = require('mongoose');

const ProgressUpdateSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide progress update title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide progress details'],
      trim: true,
    },
    weekNumber: {
      type: Number,
      required: [true, 'Please provide week number'],
      min: 1,
      max: 52,
    },
    tasksCompleted: [
      {
        type: String,
        trim: true,
      },
    ],
    nextWeekPlan: [
      {
        type: String,
        trim: true,
      },
    ],
    blockers: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'reviewed'],
      default: 'submitted',
    },
    supervisorNote: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ProgressUpdate', ProgressUpdateSchema);
