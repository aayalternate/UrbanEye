const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Complaint',
  },
  type: {
    type: String,
    enum: ['status_update', 'escalated'],
    default: 'status_update',
  },
  message: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
  media: {
    type: String, // base64 image for completion notice
  },
  newStatus: {
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
