const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Please provide document title'],
      trim: true,
    },
    milestoneKey: {
      type: String,
      enum: ['proposal_doc', 'srs', 'mid_report', 'final_thesis', 'source_code', 'other'],
      default: 'proposal_doc',
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      max: [10 * 1024 * 1024, 'File size cannot exceed 10MB'],
    },
    mimeType: {
      type: String,
      required: true,
      enum: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'needs_revision'],
      default: 'pending',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', DocumentSchema);
