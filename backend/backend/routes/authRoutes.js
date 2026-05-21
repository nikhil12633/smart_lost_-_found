const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      role: user.role,
      phone: user.phone,
    },
    process.env.JWT_SECRET || 'secret123',
    {
      expiresIn: '7d',
    }
  );
};

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone) return res.status(400).json({ message: 'Phone is required' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (password) {
      if (!user.password) return res.status(401).json({ message: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/staff-login', async (req, res) => {
  try {
    const { staffName, password } = req.body;
    if (!staffName || !password) {
      return res.status(400).json({ message: 'Staff name and password are required' });
    }

    const envName = process.env.STAFF_NAME || 'stationstaff';
    const envPassword = process.env.STAFF_PASSWORD || 'staff123';
    if (staffName === envName && password === envPassword) {
      let user = await User.findOne({ phone: 'STAFF-LOGIN' });
      if (!user) {
        user = await User.create({
          name: 'Station Staff',
          phone: 'STAFF-LOGIN',
          role: 'staff',
        });
      }
      const token = signToken(user);
      return res.json({ token, user });
    }

    const user = await User.findOne({
      $or: [{ name: staffName }, { phone: staffName }],
      role: { $in: ['staff', 'admin'] },
    });
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid staff credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid staff credentials' });

    const token = signToken(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'Phone and password are required' });

    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ message: 'Phone already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, phone, password: hashed, role: role || 'staff' });
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
