const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { generateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

exports.register = async (req, res, next) => {
  try {
    const { name, phone, email, password, role, village, district, state, language, specialization, licenseNumber } = req.body;

    if (await User.findOne({ phone })) {
      return res.status(400).json({ message: 'Phone already registered' });
    }

    const healthCardId = `HC-${uuidv4().slice(0, 8).toUpperCase()}`;
    const user = await User.create({ name, phone, email, password, role, village, district, state, language, healthCardId });

    if (role === 'patient') {
      await Patient.create({ user: user._id, healthCardId });
    } else if (role === 'doctor') {
      await Doctor.create({ user: user._id, specialization: specialization || 'General', licenseNumber: licenseNumber || `LIC-${uuidv4().slice(0, 8)}` });
    }

    res.status(201).json({ token: generateToken(user._id), user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save();
    res.json({ token: generateToken(user._id), user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user.toSafeObject());
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'email', 'village', 'district', 'state', 'language'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};
