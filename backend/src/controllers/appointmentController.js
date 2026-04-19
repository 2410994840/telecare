const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const axios = require('axios');

exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, scheduledAt, type, symptoms, urgency, bookedVia } = req.body;
    let patient = await Patient.findOne({ user: req.user._id });
    if (!patient) patient = await Patient.create({ user: req.user._id, healthCardId: req.user.healthCardId });

    // AI urgency analysis
    let aiAnalysis = null;
    if (symptoms?.length) {
      try {
        const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/analyze`, { symptoms });
        aiAnalysis = data;
      } catch {}
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      scheduledAt,
      type: type || 'video',
      symptoms,
      urgency: aiAnalysis?.urgency || urgency || 'low',
      aiAnalysis,
      village: req.user.village,
      bookedVia: bookedVia || 'app'
    });

    await Doctor.findByIdAndUpdate(doctorId, { $inc: { currentLoad: 1 } });
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
};

exports.getMyAppointments = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const appointments = await Appointment.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ scheduledAt: -1 });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    const appointments = await Appointment.find({ doctor: doctor._id, status: { $in: ['pending', 'confirmed'] } })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name phone village' } })
      .sort({ urgency: -1, scheduledAt: 1 });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    next(err);
  }
};

// For patients/asha_worker — pick a doctor to book
exports.getAvailableDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name language')
      .select('user specialization currentLoad maxDailyPatients isOnline languages')
      .sort({ isOnline: -1, currentLoad: 1 });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
};

// For doctors/admin — full doctor list with load & assigned villages
exports.getDoctorList = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email phone village')
      .sort({ currentLoad: -1 });
    res.json(doctors);
  } catch (err) {
    next(err);
  }
};
