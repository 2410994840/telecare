const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  scheduledAt: { type: Date, required: true },
  type: { type: String, enum: ['video', 'audio', 'text', 'in_person'], default: 'video' },
  status: { type: String, enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  urgency: { type: String, enum: ['low', 'medium', 'critical'], default: 'low' },
  symptoms: [String],
  aiAnalysis: { type: mongoose.Schema.Types.Mixed },
  notes: { type: String },
  village: { type: String },
  bookedVia: { type: String, enum: ['app', 'kiosk', 'ivr', 'sms', 'asha'], default: 'app' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
