const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    milestoneKey: {
      type: String,
      enum: ['proposal_defense', 'srs', 'mid_evaluation', 'final_defense', 'final_thesis'],
      required: true,
    },
    marksAwarded: {
      type: Number,
      required: [true, 'Please specify marks awarded'],
      min: [0, 'Marks cannot be less than 0'],
    },
    maxMarks: {
      type: Number,
      default: 100,
      min: [1, 'Maximum marks must be at least 1'],
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate marks entry for the same milestone and student in a project
MarksSchema.index({ project: 1, milestoneKey: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Marks', MarksSchema);
