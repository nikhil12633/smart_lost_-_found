const express = require('express');
const Delivery = require('../models/Delivery');
const LostItem = require('../models/LostItem');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/create', auth, async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const delivery = await Delivery.create({
      itemId: req.body.itemId,
      ownerName: req.body.ownerName,
      address: req.body.address,
      otp,
      status: 'dispatched',
    });

    const lostItem = await LostItem.findById(req.body.itemId);
    if (lostItem) {
      lostItem.status = 'dispatched';
      await lostItem.save();
    }

    const io = req.app.get('io');
    if (io) io.emit('deliveryUpdate', delivery);

    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { deliveryId, otp } = req.body;
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    if (delivery.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    delivery.status = 'delivered';
    await delivery.save();

    const lostItem = await LostItem.findById(delivery.itemId);
    if (lostItem) {
      lostItem.status = 'delivered';
      await lostItem.save();
    }

    const io = req.app.get('io');
    if (io) io.emit('deliveryCompleted', delivery);

    res.json({ success: true, message: 'Delivery completed', delivery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', auth, authorize('staff', 'admin'), async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    delivery.status = req.body.status || delivery.status;
    await delivery.save();
    res.json({ message: 'Delivery status updated', delivery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;