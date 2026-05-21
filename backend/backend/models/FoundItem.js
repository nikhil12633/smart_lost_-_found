const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  pnr: String,
  locationFound: String,
  station: String,
  trainNumber: String,
  foundDate: Date,
  imageUrl: String,
  status: {
    type: String,
    enum: ['found', 'under_verification', 'matched', 'returned'],
    default: 'found',
  },
  matchedLostItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostItem',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FoundItem', foundItemSchema);
