const express = require('express');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
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
      userId: req.user._id,
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

// @route   PUT /api/complaints/:id/escalate
// @desc    Update complaint level (escalate)
// @access  Private (Admin)
router.put('/:id/escalate', protect, admin, async (req, res) => {
  try {
    const { level, passedFrom } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
      complaint.level = level || complaint.level;
      complaint.passedFrom = passedFrom || complaint.passedFrom;
      const updatedComplaint = await complaint.save();
      res.json(updatedComplaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @route   PUT /api/complaints/:id/status
// @desc    Update complaint status (In Progress / Resolved) with optional media
// @access  Private (Admin)
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, note, image } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status || complaint.status;
    if (note) complaint.resolutionNote = note;
    if (image) complaint.resolutionImage = image;

    const updatedComplaint = await complaint.save();

    // Create notification for the user who filed the complaint
    const statusText = status === 'Resolved' ? 'has been resolved' : 'is now in progress';
    await Notification.create({
      userId: complaint.userId,
      complaintId: complaint._id,
      type: 'status_update',
      message: `Your complaint "${complaint.title}" ${statusText}.`,
      note: note || '',
      media: image || '',
      newStatus: status,
    });

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
