const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ['success', 'failure'], default: 'success' },
  details: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

module.exports = mongoose.model('AuditLog', auditLogSchema);
