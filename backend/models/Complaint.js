const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'Other',
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
  },
  image: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending',
  },
  clusterId: {
    type: String,
  },
  level: {
    type: String,
    enum: ['Panchayath', 'Panchayat', 'District', 'State'],
    default: 'Panchayath',
  },
  passedFrom: {
    type: String,
  },
  resolutionNote: {
    type: String,
  },
  resolutionImage: {
    type: String,
  },
}, {
  timestamps: true,
});

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
