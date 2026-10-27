const mongoose = require('mongoose');

const TopMatchSchema = new mongoose.Schema(
  {
    previousFypId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PreviousFYP',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
    },
    domain: {
      type: String,
    },
    similarityPercentage: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const SimilarityResultSchema = new mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
      index: true,
    },
    maxSimilarity: {
      type: Number,
      required: true,
      default: 0,
    },
    hasWarning: {
      type: Boolean,
      default: false,
    },
    warningMessage: {
      type: String,
      default: '',
    },
    topMatches: [TopMatchSchema],
    checkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SimilarityResult', SimilarityResultSchema);
