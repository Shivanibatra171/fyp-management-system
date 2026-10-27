const mongoose = require('mongoose');

const PreviousFYPSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide previous FYP title'],
      trim: true,
      index: true,
    },
    abstract: {
      type: String,
      required: [true, 'Please provide previous FYP abstract'],
      trim: true,
    },
    domain: {
      type: String,
      required: [true, 'Please provide project domain (e.g. AI/ML, Cloud, Web, IoT)'],
      trim: true,
      index: true,
    },
    year: {
      type: Number,
      required: [true, 'Please provide completion year'],
      index: true,
    },
    supervisorName: {
      type: String,
      required: [true, 'Please provide supervisor name'],
      trim: true,
    },
    studentNames: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    grade: {
      type: String,
      default: 'A',
      trim: true,
    },
    documentUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for search
PreviousFYPSchema.index({ title: 'text', abstract: 'text', domain: 'text' });

module.exports = mongoose.model('PreviousFYP', PreviousFYPSchema);
