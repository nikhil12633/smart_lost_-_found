const express = require('express');
const LostItem = require('../models/LostItem');
const Delivery = require('../models/Delivery');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Tracking item not found' });

    const delivery = await Delivery.findOne({ itemId: item._id });
    const timeline = [
      { status: item.status, label: 'Current status' },
      ...(delivery ? [{ status: delivery.status, label: 'Delivery status' }] : []),
    ];

    res.json({ item, delivery, timeline });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;