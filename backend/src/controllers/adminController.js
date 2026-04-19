const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const IoTReading = require('../models/IoTReading');
const AuditLog = require('../models/AuditLog');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalPatients, totalDoctors, todayAppointments, criticalAlerts] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments({ scheduledAt: { $gte: new Date().setHours(0, 0, 0, 0) } }),
      Appointment.countDocuments({ urgency: 'critical', status: { $in: ['pending', 'confirmed'] } })
    ]);

    res.json({ totalPatients, totalDoctors, todayAppointments, criticalAlerts });
  } catch (err) {
    next(err);
  }
};

exports.getVillageStats = async (req, res, next) => {
  try {
    const stats = await Appointment.aggregate([
      {
        $lookup: {
          from: 'users', localField: 'patient', foreignField: '_id', as: 'patientUser'
        }
      },
      { $unwind: { path: '$patientUser', preserveNullAndEmpty: true } },
      {
        $group: {
          _id: '$village',
          count: { $sum: 1 },
          critical: { $sum: { $cond: [{ $eq: ['$urgency', 'critical'] }, 1, 0] } },
          lat: { $first: '$patientUser.coordinates.lat' },
          lng: { $first: '$patientUser.coordinates.lng' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

exports.getDoctorLoadBalancing = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name');
    const loadData = doctors.map(d => ({
      id: d._id,
      name: d.user?.name,
      currentLoad: d.currentLoad,
      maxLoad: d.maxDailyPatients,
      loadPercent: Math.round((d.currentLoad / d.maxDailyPatients) * 100),
      isOnline: d.isOnline
    }));
    res.json(loadData);
  } catch (err) {
    next(err);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await AuditLog.find()
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

exports.getDiseaseTrends = async (req, res, next) => {
  try {
    const trends = await Appointment.aggregate([
      { $unwind: '$symptoms' },
      { $group: { _id: { symptom: '$symptoms', village: '$village' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);
    res.json(trends);
  } catch (err) {
    next(err);
  }
};
