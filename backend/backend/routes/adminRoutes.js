const express = require('express');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Delivery = require('../models/Delivery');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/reports', auth, authorize('admin'), async (req, res) => {
  try {
    const lostItems = await LostItem.find().sort({ createdAt: -1 });
    const foundItems = await FoundItem.find().sort({ createdAt: -1 });
    const deliveries = await Delivery.find().sort({ createdAt: -1 });
    res.json({ lostItems, foundItems, deliveries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/lost/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Lost item not found' });
    item.status = req.body.status || item.status;
    await item.save();
    res.json({ message: 'Lost item status updated', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
