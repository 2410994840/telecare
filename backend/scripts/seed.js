require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User = require('../src/models/User');
const Doctor = require('../src/models/Doctor');
const Patient = require('../src/models/Patient');

const doctors = [
  { name: 'Dr. Priya Sharma',  phone: '9000000001', specialization: 'General Physician', village: 'Lucknow',  district: 'Lucknow',  state: 'UP' },
  { name: 'Dr. Arjun Mehta',   phone: '9000000002', specialization: 'Pediatrics',         village: 'Kanpur',   district: 'Kanpur',   state: 'UP' },
  { name: 'Dr. Sunita Rao',    phone: '9000000003', specialization: 'Gynecology',          village: 'Varanasi', district: 'Varanasi', state: 'UP' },
];

const patients = [
  { name: 'Ramesh Kumar', phone: '9100000001', village: 'Rampur',  district: 'Lucknow', state: 'UP' },
  { name: 'Sita Devi',    phone: '9100000002', village: 'Sitapur', district: 'Sitapur', state: 'UP' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const password = 'password123';

  for (const d of doctors) {
    if (await User.findOne({ phone: d.phone })) { console.log(`Skip ${d.name}`); continue; }
    const user = await User.create({ ...d, password, role: 'doctor', healthCardId: `HC-${uuidv4().slice(0,8).toUpperCase()}` });
    await Doctor.create({ user: user._id, specialization: d.specialization, licenseNumber: `LIC-${uuidv4().slice(0,8).toUpperCase()}`, isOnline: true });
    console.log(`Created doctor: ${d.name}`);
  }

  for (const p of patients) {
    if (await User.findOne({ phone: p.phone })) { console.log(`Skip ${p.name}`); continue; }
    const healthCardId = `HC-${uuidv4().slice(0,8).toUpperCase()}`;
    const user = await User.create({ ...p, password, role: 'patient', healthCardId });
    await Patient.create({ user: user._id, healthCardId });
    console.log(`Created patient: ${p.name}`);
  }

  if (!await User.findOne({ phone: '9999999999' })) {
    await User.create({ name: 'Admin', phone: '9999999999', password, role: 'admin', village: 'Delhi', district: 'Delhi', state: 'Delhi', healthCardId: 'HC-ADMIN001' });
    console.log('Created admin: 9999999999');
  }

  console.log('\nDone. All passwords: password123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
