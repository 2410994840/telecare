const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const Doctor = require('../models/Doctor');

router.use(protect);

router.get('/profile', authorize('doctor'), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', '-password');
    res.json(doctor);
  } catch (err) { next(err); }
});

router.put('/status', authorize('doctor'), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { isOnline: req.body.isOnline },
      { new: true }
    );
    res.json(doctor);
  } catch (err) { next(err); }
});

router.put('/slots', authorize('doctor'), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.user._id },
      { availableSlots: req.body.slots },
      { new: true }
    );
    res.json(doctor);
  } catch (err) { next(err); }
});

module.exports = router;
