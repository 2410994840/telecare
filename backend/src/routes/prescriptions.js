const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { createPrescription, getPatientPrescriptions, getPrescriptionById } = require('../controllers/prescriptionController');

router.use(protect);
router.post('/', authorize('doctor'), createPrescription);
router.get('/my', authorize('patient'), getPatientPrescriptions);
router.get('/:id', getPrescriptionById);

module.exports = router;
