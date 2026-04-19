const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const Alert = require('../models/Alert');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const query = { isActive: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] };
    if (req.user.village) query.$or = [{ targetVillages: req.user.village }, { targetVillages: { $size: 0 } }];
    const alerts = await Alert.find(query).sort({ createdAt: -1 }).limit(20);
    res.json(alerts);
  } catch (err) { next(err); }
});

router.post('/', authorize('admin', 'doctor'), async (req, res, next) => {
  try {
    const alert = await Alert.create({ ...req.body, sentBy: req.user._id });
    res.status(201).json(alert);
  } catch (err) { next(err); }
});

module.exports = router;
