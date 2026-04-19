const axios = require('axios');

exports.analyzeSymptoms = async (req, res, next) => {
  try {
    const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/analyze`, req.body);
    res.json(data);
  } catch (err) {
    // Rule-based fallback
    const { symptoms = [] } = req.body;
    const critical = ['chest pain', 'difficulty breathing', 'unconscious', 'stroke', 'seizure'];
    const medium = ['high fever', 'vomiting', 'severe headache', 'abdominal pain'];
    const urgency = symptoms.some(s => critical.some(c => s.toLowerCase().includes(c))) ? 'critical'
      : symptoms.some(s => medium.some(m => s.toLowerCase().includes(m))) ? 'medium' : 'low';

    res.json({ urgency, diseases: [], confidence: 0, fallback: true, message: 'AI service unavailable, rule-based analysis used' });
  }
};

exports.getDiseaseTrends = async (req, res, next) => {
  try {
    const { data } = await axios.get(`${process.env.AI_SERVICE_URL}/trends`, { params: req.query });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getSchemeRecommendations = async (req, res, next) => {
  try {
    const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/schemes`, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
