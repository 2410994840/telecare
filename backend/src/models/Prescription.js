const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String },
    frequency: { type: String },
    duration: { type: String },
    instructions: { type: String },
    reminderEnabled: { type: Boolean, default: false },
    reminderTimes: [String]
  }],
  diagnosis: { type: String },
  advice: { type: String },
  followUpDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
