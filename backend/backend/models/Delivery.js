const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LostItem',
  },
  ownerName: String,
  address: String,
  otp: String,
  status: {
    type: String,
    enum: ['dispatched', 'in_transit', 'out_for_delivery', 'delivered'],
    default: 'dispatched',
  },
  deliveryAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Delivery', deliverySchema);
