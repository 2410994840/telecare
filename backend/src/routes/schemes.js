const router = require('express').Router();
const { protect } = require('../middleware/auth');

const SCHEMES = [
  { id: 'pmjay', name: 'Ayushman Bharat PM-JAY', description: 'Health coverage up to ₹5 lakh per family', eligibility: { maxIncome: 100000, categories: ['BPL', 'SC', 'ST'] } },
  { id: 'jssk', name: 'Janani Shishu Suraksha Karyakram', description: 'Free maternity services', eligibility: { gender: 'female', ageRange: [15, 45] } },
  { id: 'rbsk', name: 'Rashtriya Bal Swasthya Karyakram', description: 'Child health screening', eligibility: { ageRange: [0, 18] } },
  { id: 'npcdcs', name: 'NPCDCS', description: 'Non-communicable disease control', eligibility: { conditions: ['diabetes', 'hypertension', 'cancer'] } }
];

router.use(protect);

router.get('/', (req, res) => res.json(SCHEMES));

router.post('/check-eligibility', (req, res) => {
  const { age, gender, income, conditions = [], category } = req.body;
  const eligible = SCHEMES.filter(scheme => {
    const e = scheme.eligibility;
    if (e.maxIncome && income > e.maxIncome) return false;
    if (e.gender && e.gender !== gender) return false;
    if (e.ageRange && (age < e.ageRange[0] || age > e.ageRange[1])) return false;
    if (e.categories && !e.categories.includes(category)) return false;
    if (e.conditions && !e.conditions.some(c => conditions.includes(c))) return false;
    return true;
  });
  res.json(eligible);
});

module.exports = router;
