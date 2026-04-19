const IoTReading = require('../models/IoTReading');
const Patient = require('../models/Patient');
const Alert = require('../models/Alert');

const THRESHOLDS = {
  bloodPressure: { systolic: { high: 140, low: 90 }, diastolic: { high: 90, low: 60 } },
  temperature: { high: 38.5, low: 35 },
  pulse: { high: 100, low: 50 },
  oxygenSaturation: { low: 94 }
};

const checkAlerts = (readings) => {
  const alerts = [];
  const { bloodPressure, temperature, pulse, oxygenSaturation } = readings;

  if (bloodPressure) {
    if (bloodPressure.systolic > THRESHOLDS.bloodPressure.systolic.high) alerts.push('High blood pressure detected');
    if (bloodPressure.systolic < THRESHOLDS.bloodPressure.systolic.low) alerts.push('Low blood pressure detected');
  }
  if (temperature?.value > THRESHOLDS.temperature.high) alerts.push('High fever detected');
  if (pulse?.value > THRESHOLDS.pulse.high) alerts.push('High pulse rate');
  if (pulse?.value < THRESHOLDS.pulse.low) alerts.push('Low pulse rate');
  if (oxygenSaturation?.value < THRESHOLDS.oxygenSaturation.low) alerts.push('Low oxygen saturation - CRITICAL');

  return alerts;
};

exports.submitReading = async (req, res, next) => {
  try {
    const { healthCardId, deviceId, readings, location } = req.body;
    const patient = await Patient.findOne({ healthCardId });
    if (!patient) return res.status(404).json({ message: 'Patient not found for health card' });

    const alerts = checkAlerts(readings);
    const iotReading = await IoTReading.create({ patient: patient._id, healthCardId, deviceId, readings, alerts, location });

    if (alerts.some(a => a.includes('CRITICAL'))) {
      await Alert.create({
        type: 'emergency',
        title: 'Critical IoT Alert',
        message: `Critical reading for patient ${healthCardId}: ${alerts.join(', ')}`,
        severity: 'critical',
        targetVillages: [location?.village],
        targetRoles: ['doctor', 'admin']
      });
    }

    res.status(201).json({ reading: iotReading, alerts });
  } catch (err) {
    next(err);
  }
};

exports.getPatientReadings = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const readings = await IoTReading.find({ patient: patient._id }).sort({ createdAt: -1 }).limit(20);
    res.json(readings);
  } catch (err) {
    next(err);
  }
};
