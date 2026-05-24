const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const showOtpInResponse = process.env.OTP_DEBUG === 'true' || process.env.NODE_ENV !== 'production';

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

router.post('/send', async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ phone });
    if (!user) user = new User({ phone });
    if (name) user.name = name;
    user.otp = otp;
    user.otpExpires = expires;
    await user.save();

    console.log(`OTP for ${phone}: ${otp}`);
    res.json({
      message: 'OTP sent',
      devOtp: showOtpInResponse ? otp : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

    const user = await User.findOne({ phone });
    if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = signToken(user);
    res.json({ message: 'OTP Verified', token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
