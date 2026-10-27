const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide proposal title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    abstract: {
      type: String,
      required: [true, 'Please provide proposal abstract/description'],
      trim: true,
    },
    domain: {
      type: String,
      required: [true, 'Please specify the domain (e.g. AI/ML, Web, Mobile, IoT)'],
      trim: true,
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        name: { type: String, required: true, trim: true },
        studentId: { type: String, default: '', trim: true },
        email: { type: String, default: '', trim: true },
      },
    ],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'changes_requested'],
      default: 'pending',
    },
    similarityScore: {
      type: Number,
      default: 0,
    },
    similarityWarning: {
      type: Boolean,
      default: false,
    },
    similarityResult: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SimilarityResult',
    },
    supervisorRemarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

ProposalSchema.index({ title: 'text', abstract: 'text', domain: 'text' });

module.exports = mongoose.model('Proposal', ProposalSchema);
