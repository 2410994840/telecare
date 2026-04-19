const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { submitReading, getPatientReadings } = require('../controllers/iotController');

// IoT devices use API key auth (simplified)
router.post('/reading', submitReading);
router.get('/my-readings', protect, authorize('patient'), getPatientReadings);

module.exports = router;
