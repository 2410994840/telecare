const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  bloodGroup: { type: String },
  allergies: [String],
  chronicConditions: [String],
  encryptedMedicalHistory: { type: String }, // AES encrypted
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  assignedAshaWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  governmentSchemes: [{ type: String }],
  healthCardId: { type: String, unique: true, sparse: true },
  offlineSyncQueue: [{ type: mongoose.Schema.Types.Mixed }]
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
