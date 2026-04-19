const AuditLog = require('../models/AuditLog');

const requestLogger = async (req, res, next) => {
  const start = Date.now();
  res.on('finish', async () => {
    if (req.user) {
      await AuditLog.create({
        user: req.user._id,
        action: `${req.method} ${req.path}`,
        resource: req.path.split('/')[3],
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        status: res.statusCode < 400 ? 'success' : 'failure',
        details: { statusCode: res.statusCode, duration: Date.now() - start }
      }).catch(() => {});
    }
  });
  next();
};

module.exports = { requestLogger };
