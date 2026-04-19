const mongoose = require('mongoose');

const iotReadingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  healthCardId: { type: String },
  deviceId: { type: String },
  readings: {
    bloodPressure: { systolic: Number, diastolic: Number },
    temperature: { value: Number, unit: { type: String, default: 'C' } },
    pulse: { value: Number },
    oxygenSaturation: { value: Number },
    bloodGlucose: { value: Number }
  },
  alerts: [{ type: String }],
  location: { village: String, district: String },
  syncedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('IoTReading', iotReadingSchema);
