const express = require('express');
const multer = require('multer');
const path = require('path');
const FoundItem = require('../models/FoundItem');
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

router.post('/', auth, authorize('staff', 'admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.body.pnr) return res.status(400).json({ message: 'PNR is required' });
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    let imageUrl;
    if (req.file) {
      try {
        imageUrl = (await uploadImage(req.file.path)) || `${hostUrl}/uploads/${req.file.filename}`;
      } catch (uploadError) {
        console.error('Found item image upload failed, using local upload path:', uploadError);
        imageUrl = `${hostUrl}/uploads/${req.file.filename}`;
      }
      console.log("IMAGE URL:", imageUrl);
    }
    console.log('Found item imageUrl:', imageUrl);

    const foundItem = await FoundItem.create({
      title: req.body.title,
      description: req.body.description,
      pnr: req.body.pnr,
      locationFound: req.body.locationFound,
      station: req.body.station,
      trainNumber: req.body.trainNumber,
      foundDate: req.body.foundDate || new Date(),
      matchedLostItem: req.body.matchedLostItem || undefined,
      reportedBy: req.user._id,
      imageUrl,
    });

    const searchTerm = req.body.title || '';
    const matches = await LostItem.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ],
      status: { $in: ['reported', 'under_verification'] },
    }).limit(5);

    if (matches.length > 0) {
      foundItem.status = 'matched';
      foundItem.matchedLostItem = matches[0]._id;
      await foundItem.save();

      const firstMatch = matches[0];
      firstMatch.status = 'matched';
      firstMatch.matchedFoundItem = foundItem._id;
      firstMatch.verificationNotes = 'Staff found and matched this item.';
      await firstMatch.save();
      try {
        await sendLostItemStatusEmail({ item: firstMatch, foundItem, status: 'found' });
      } catch (emailError) {
        console.error('Found email send failed:', emailError);
      }

      const io = req.app.get('io');
      if (io) {
        io.emit('matchFound', { foundItem, matches });
      }
    }

    res.status(201).json({ message: 'Found item uploaded', foundItem, matches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/match/:lostId', auth, authorize('staff', 'admin'), upload.single('image'), async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.lostId);
    if (!lostItem) return res.status(404).json({ message: 'Lost report not found' });
    if (!req.body.pnr && !lostItem.pnr) return res.status(400).json({ message: 'PNR is required' });

    const hostUrl = `${req.protocol}://${req.get('host')}`;
    let imageUrl;
    if (req.file) {
      try {
        imageUrl = (await uploadImage(req.file.path)) || `${hostUrl}/uploads/${req.file.filename}`;
      } catch (uploadError) {
        console.error('Found match image upload failed, using local upload path:', uploadError);
        imageUrl = `${hostUrl}/uploads/${req.file.filename}`;
      }
    }
    console.log('Found match imageUrl:', imageUrl);

    if (req.file) {
      console.log('Staff found image upload received:', req.file.originalname, req.file.path);
    } else {
      console.log('No staff found image received for match request:', req.params.lostId);
    }

    const foundItem = await FoundItem.create({
      title: req.body.title || lostItem.title,
      description: req.body.description,
      pnr: req.body.pnr || lostItem.pnr,
      locationFound: req.body.locationFound,
      station: req.body.station,
      trainNumber: req.body.trainNumber || lostItem.trainNumber,
      foundDate: req.body.foundDate || new Date(),
      imageUrl,
      status: 'matched',
      matchedLostItem: lostItem._id,
      reportedBy: req.user._id,
    });

    lostItem.status = 'matched';
    lostItem.matchedFoundItem = foundItem._id;
    lostItem.verificationNotes = req.body.verificationNotes || 'Staff found and matched this item.';
    await lostItem.save();
    try {
      await sendLostItemStatusEmail({ item: lostItem, foundItem, status: 'found' });
    } catch (emailError) {
      console.error('Found email send failed:', emailError);
    }

    const io = req.app.get('io');
    if (io) io.emit('matchFound', { foundItem, lostItem });

    res.status(201).json({ message: 'Found item matched to lost report', foundItem, lostItem });
  } catch (error) {
    console.error('Error in /api/found/match/:lostId', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, authorize('staff', 'admin'), async (req, res) => {
  try {
    const items = await FoundItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
