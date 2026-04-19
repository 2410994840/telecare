const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  experience: { type: Number },
  languages: [String],
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  currentLoad: { type: Number, default: 0 },
  maxDailyPatients: { type: Number, default: 30 },
  isOnline: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalConsultations: { type: Number, default: 0 },
  assignedVillages: [String]
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
