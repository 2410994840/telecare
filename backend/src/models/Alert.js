const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: { type: String, enum: ['outbreak', 'emergency', 'broadcast', 'medicine_reminder', 'appointment'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  targetVillages: [String],
  targetDistricts: [String],
  targetRoles: [String],
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
