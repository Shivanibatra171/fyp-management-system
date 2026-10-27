const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide project title'],
      trim: true,
    },
    abstract: {
      type: String,
      required: [true, 'Please provide project abstract'],
    },
    domain: {
      type: String,
      required: true,
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'mid_evaluation', 'final_evaluation', 'completed', 'dropped'],
      default: 'in-progress',
    },
    currentMilestone: {
      type: String,
      enum: ['proposal_defense', 'srs', 'mid_evaluation', 'final_thesis', 'completed'],
      default: 'srs',
    },
    finalMarks: {
      type: Number,
      default: null,
    },
    finalGrade: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', ProjectSchema);
