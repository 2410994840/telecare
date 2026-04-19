const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { bookAppointment, getMyAppointments, getDoctorAppointments, updateAppointmentStatus, getAvailableDoctors, getDoctorList } = require('../controllers/appointmentController');

router.use(protect);
router.post('/', authorize('patient', 'asha_worker'), bookAppointment);
router.get('/my', authorize('patient'), getMyAppointments);
router.get('/doctor', authorize('doctor'), getDoctorAppointments);
router.get('/available-doctors', authorize('patient', 'asha_worker'), getAvailableDoctors);
router.get('/doctor-list', authorize('doctor', 'admin'), getDoctorList);
router.put('/:id/status', authorize('doctor', 'admin'), updateAppointmentStatus);

module.exports = router;
