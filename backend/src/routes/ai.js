const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { analyzeSymptoms, getDiseaseTrends, getSchemeRecommendations } = require('../controllers/aiController');

router.use(protect);
router.post('/analyze', analyzeSymptoms);
router.get('/trends', getDiseaseTrends);
router.post('/schemes', getSchemeRecommendations);

module.exports = router;
