const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  startedAt: { type: Date },
  endedAt: { type: Date },
  mode: { type: String, enum: ['video', 'audio', 'text'], default: 'video' },
  chatHistory: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    timestamp: { type: Date, default: Date.now },
    isOffline: { type: Boolean, default: false }
  }],
  diagnosis: { type: String },
  encryptedNotes: { type: String },
  followUpDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
