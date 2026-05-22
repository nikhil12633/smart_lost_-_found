const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  pnr: String,
  locationLost: String,
  station: String,
  trainNumber: String,
  lostDate: Date,
  ownerName: String,
  ownerEmail: String,
  contact: String,
  deliveryAddress: String,
  collectionPreference: {
    type: String,
    enum: ['delivery', 'station_pickup'],
    default: 'station_pickup',
  },
  imageUrl: String,
  proofUrl: String,
  status: {
    type: String,
    enum: ['reported', 'under_verification', 'matched', 'dispatched', 'out_for_delivery', 'delivered'],
    default: 'reported',
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  ownerPhone: String,
  matchedFoundItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoundItem',
  },
  verificationNotes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LostItem', lostItemSchema);
