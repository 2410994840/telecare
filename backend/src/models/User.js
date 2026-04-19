const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'asha_worker', 'admin'], required: true },
  village: { type: String },
  district: { type: String },
  state: { type: String },
  coordinates: { lat: { type: Number }, lng: { type: Number } },
  language: { type: String, default: 'en' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  healthCardId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
