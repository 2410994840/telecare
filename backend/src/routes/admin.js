const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboardStats, getVillageStats, getDoctorLoadBalancing, getAuditLogs, getDiseaseTrends } = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/stats', getDashboardStats);
router.get('/village-stats', getVillageStats);
router.get('/doctor-load', getDoctorLoadBalancing);
router.get('/audit-logs', getAuditLogs);
router.get('/disease-trends', getDiseaseTrends);

module.exports = router;
