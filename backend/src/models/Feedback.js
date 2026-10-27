const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    milestoneKey: {
      type: String,
      default: 'general',
    },
    content: {
      type: String,
      required: [true, 'Please provide feedback content'],
      trim: true,
    },
    feedbackType: {
      type: String,
      enum: ['proposal_feedback', 'milestone_review', 'general_guidance', 'defense_critique'],
      default: 'proposal_feedback',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', FeedbackSchema);
