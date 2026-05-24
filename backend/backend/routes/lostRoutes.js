const express = require('express');
const multer = require('multer');
const path = require('path');
const LostItem = require('../models/LostItem');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { uploadImage } = require('../utils/cloudinary');
const { sendLostItemStatusEmail } = require('../utils/email');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/', auth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'proof', maxCount: 1 }]), async (req, res) => {
  try {
    const fields = req.body;
    if (!fields.pnr) return res.status(400).json({ message: 'PNR is required' });
    if (!fields.ownerEmail) return res.status(400).json({ message: 'Email is required' });
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const imageFile = req.files?.image?.[0];
    const proofFile = req.files?.proof?.[0];

    let imageUrl;
    if (imageFile) {
      try {
        imageUrl = (await uploadImage(imageFile.path)) || `${hostUrl}/uploads/${imageFile.filename}`;
      } catch (uploadError) {
        console.error('Lost report image upload failed, using local upload path:', uploadError);
        imageUrl = `${hostUrl}/uploads/${imageFile.filename}`;
      }
      console.log("IMAGE URL:", imageUrl);
    }

    let proofUrl;
    if (proofFile) {
      try {
        proofUrl = (await uploadImage(proofFile.path)) || `${hostUrl}/uploads/${proofFile.filename}`;
      } catch (uploadError) {
        console.error('Lost report proof upload failed, using local upload path:', uploadError);
        proofUrl = `${hostUrl}/uploads/${proofFile.filename}`;
      }
    }
    console.log('Lost report imageUrl:', imageUrl, 'proofUrl:', proofUrl);

    const lostItem = await LostItem.create({
      title: fields.title,
      description: fields.description,
      pnr: fields.pnr,
      locationLost: fields.locationLost,
      station: fields.station,
      trainNumber: fields.trainNumber,
      lostDate: fields.lostDate || new Date(),
      ownerName: fields.ownerName,
      ownerEmail: fields.ownerEmail,
      contact: fields.contact,
      deliveryAddress: fields.deliveryAddress,
      collectionPreference: fields.collectionPreference || 'station_pickup',
      reportedBy: req.user._id,
      ownerPhone: req.user.phone || fields.contact,
      imageUrl,
      proofUrl,
    });

    res.status(201).json({ message: 'Lost item reported successfully', lostItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, authorize('staff', 'admin'), async (req, res) => {
  try {
    const items = await LostItem.find().populate('matchedFoundItem').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const items = await LostItem.find({
      $or: [{ reportedBy: req.user._id }, { ownerPhone: req.user.phone }],
    }).populate('matchedFoundItem').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/pending', auth, authorize('staff', 'admin'), async (req, res) => {
  try {
    const items = await LostItem.find({ status: { $in: ['reported', 'under_verification'] } }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Lost item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', auth, authorize('staff', 'admin'), async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Lost item not found' });
    item.status = req.body.status || item.status;
    item.verificationNotes = req.body.verificationNotes || item.verificationNotes;
    await item.save();
    if (item.status === 'under_verification') {
      try {
        await sendLostItemStatusEmail({ item, status: 'not_found' });
      } catch (emailError) {
        console.error('Not-found email failed:', emailError);
      }
    }
    res.json({ message: 'Status updated', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/not-found', auth, authorize('staff', 'admin'), async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Lost item not found' });
    item.status = 'under_verification';
    item.verificationNotes = req.body.verificationNotes || 'Staff checked and has not found this item yet.';
    await item.save();
    try {
      await sendLostItemStatusEmail({ item, status: 'not_found' });
    } catch (emailError) {
      console.error('Not-found email failed:', emailError);
    }

    const io = req.app.get('io');
    if (io) io.emit('lostItemUpdate', item);

    res.json({ message: 'Marked as not found yet', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
