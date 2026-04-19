const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const Patient = require('../models/Patient');
const User = require('../models/User');

router.use(protect);

router.get('/profile', authorize('patient'), async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user', '-password');
    res.json(patient);
  } catch (err) { next(err); }
});

router.put('/profile', authorize('patient'), async (req, res, next) => {
  try {
    const allowed = ['age', 'gender', 'bloodGroup', 'allergies', 'chronicConditions', 'emergencyContact'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const patient = await Patient.findOneAndUpdate({ user: req.user._id }, updates, { new: true });
    res.json(patient);
  } catch (err) { next(err); }
});

router.get('/by-health-card/:cardId', authorize('doctor', 'admin', 'asha_worker'), async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ healthCardId: req.params.cardId }).populate('user', '-password');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) { next(err); }
});

module.exports = router;
