const express = require('express');
const Complaint = require('../models/Complaint');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/complaints
// @desc    Get user's complaints
// @access  Private (User)
router.get('/', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Private (User)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, location, image, clusterId } = req.body;

    const complaint = new Complaint({
      userId: req.user._id, // Tied to the JWT user
      title,
      description,
      category,
      location,
      image,
      clusterId,
    });

    const createdComplaint = await complaint.save();
    res.status(201).json(createdComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   GET /api/complaints/admin
// @desc    Get all complaints
// @access  Private (Admin)
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const complaints = await Complaint.find({}).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
