const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const { encrypt, decrypt } = require('../utils/encryption');

exports.startConsultation = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const consultation = await Consultation.create({
      appointment: appointment._id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      mode: req.body.mode || appointment.type,
      startedAt: new Date()
    });

    await Appointment.findByIdAndUpdate(appointment._id, { status: 'in_progress' });
    res.status(201).json(consultation);
  } catch (err) {
    next(err);
  }
};

exports.endConsultation = async (req, res, next) => {
  try {
    const { diagnosis, notes } = req.body;
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        endedAt: new Date(),
        diagnosis,
        encryptedNotes: notes ? encrypt(notes) : undefined
      },
      { new: true }
    );
    res.json(consultation);
  } catch (err) {
    next(err);
  }
};

exports.getConsultation = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate({ path: 'patient', populate: { path: 'user', select: 'name phone' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    if (!consultation) return res.status(404).json({ message: 'Not found' });

    const result = consultation.toObject();
    if (result.encryptedNotes) result.notes = decrypt(result.encryptedNotes);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.syncOfflineMessages = async (req, res, next) => {
  try {
    const { messages } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) return res.status(404).json({ message: 'Not found' });

    const sorted = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    consultation.chatHistory.push(...sorted.map(m => ({ ...m, isOffline: true })));
    await consultation.save();
    res.json({ synced: sorted.length });
  } catch (err) {
    next(err);
  }
};
