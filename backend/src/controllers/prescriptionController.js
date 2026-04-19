const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');

exports.createPrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.create(req.body);
    res.status(201).json(prescription);
  } catch (err) {
    next(err);
  }
};

exports.getPatientPrescriptions = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const prescriptions = await Prescription.find({ patient: patient._id, isActive: true })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    next(err);
  }
};

exports.getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name specialization' } })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name phone' } });
    if (!prescription) return res.status(404).json({ message: 'Not found' });
    res.json(prescription);
  } catch (err) {
    next(err);
  }
};
