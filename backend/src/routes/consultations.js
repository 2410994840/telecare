const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { startConsultation, endConsultation, getConsultation, syncOfflineMessages } = require('../controllers/consultationController');

router.use(protect);
router.post('/start/:appointmentId', authorize('doctor'), startConsultation);
router.put('/:id/end', authorize('doctor'), endConsultation);
router.get('/:id', getConsultation);
router.post('/:id/sync', syncOfflineMessages);

module.exports = router;
