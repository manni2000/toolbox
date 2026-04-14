const express = require('express');
const { strictLimiter } = require('../middleware/security');

const router = express.Router();
router.use(strictLimiter);

router.post('/percentage-calculator', (req, res) => {
  const { value, total, type = 'percentage' } = req.body;
  const v = parseFloat(value);
  const t = parseFloat(total);

  let result;
  if (type === 'percentage') result = { percentage: Math.round((v / t) * 10000) / 100 };
  else if (type === 'of') result = { result: Math.round((v / 100) * t * 100) / 100 };
  else if (type === 'change') result = { change: Math.round(((t - v) / v) * 10000) / 100 };

  res.json({ success: true, result });
});

router.post('/unit-converter', (req, res) => {
  const { value, from, to, category } = req.body;
  if (!value || !from || !to || !category) return res.status(400).json({ success: false, error: 'Value, from, to, and category required' });

  const conversions = {
    length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, ft: 0.3048, in: 0.0254, yd: 0.9144 },
    weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, t: 1000 },
    temperature: null,
    volume: { l: 1, ml: 0.001, m3: 1000, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.236588, fl_oz: 0.0295735 },
    area: { m2: 1, km2: 1000000, cm2: 0.0001, ft2: 0.092903, in2: 0.00064516, acre: 4046.86, ha: 10000 },
    speed: { ms: 1, kmh: 1 / 3.6, mph: 0.44704, knot: 0.514444 },
    data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 },
    time: { s: 1, min: 60, h: 3600, day: 86400, week: 604800, month: 2629800, year: 31557600 },
  };

  if (category === 'temperature') {
    const v = parseFloat(value);
    let result;
    if (from === 'c' && to === 'f') result = v * 9 / 5 + 32;
    else if (from === 'f' && to === 'c') result = (v - 32) * 5 / 9;
    else if (from === 'c' && to === 'k') result = v + 273.15;
    else if (from === 'k' && to === 'c') result = v - 273.15;
    else if (from === 'f' && to === 'k') result = (v + 459.67) * 5 / 9;
    else if (from === 'k' && to === 'f') result = v * 9 / 5 - 459.67;
    else result = v;
    return res.json({ success: true, result: { value: v, from, to, converted: Math.round(result * 10000) / 10000 } });
  }

  const table = conversions[category];
  if (!table) return res.status(400).json({ success: false, error: 'Unknown category' });
  if (!table[from] || !table[to]) return res.status(400).json({ success: false, error: 'Unknown unit' });

  const base = parseFloat(value) * table[from];
  const converted = base / table[to];

  res.json({ success: true, result: { value: parseFloat(value), from, to, converted: Math.round(converted * 1000000) / 1000000 } });
});

router.post('/lcm-hcf', (req, res) => {
  const { numbers } = req.body;
  if (!numbers || !Array.isArray(numbers)) return res.status(400).json({ success: false, error: 'Array of numbers required' });

  const nums = numbers.map(n => parseInt(n)).filter(n => !isNaN(n) && n > 0);
  if (nums.length < 2) return res.status(400).json({ success: false, error: 'At least 2 positive integers required' });

  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  function lcm(a, b) { return (a * b) / gcd(a, b); }

  const hcf = nums.reduce(gcd);
  const lcmVal = nums.reduce(lcm);

  res.json({ success: true, result: { numbers: nums, hcf, lcm: lcmVal } });
});

router.post('/simple-interest', (req, res) => {
  const { principal, rate, time } = req.body;
  if (!principal || !rate || !time) return res.status(400).json({ success: false, error: 'Principal, rate, and time required' });

  const P = parseFloat(principal);
  const R = parseFloat(rate);
  const T = parseFloat(time);
  const SI = (P * R * T) / 100;
  const total = P + SI;

  res.json({ success: true, result: { principal: P, rate: R, time: T, simpleInterest: Math.round(SI * 100) / 100, totalAmount: Math.round(total * 100) / 100 } });
});

router.post('/cgpa-to-percentage', (req, res) => {
  const { cgpa, scale = 10 } = req.body;
  if (!cgpa) return res.status(400).json({ success: false, error: 'CGPA required' });

  const c = parseFloat(cgpa);
  const s = parseFloat(scale);
  const percentage = s === 10 ? c * 9.5 : (c / s) * 100;

  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';

  res.json({ success: true, result: { cgpa: c, scale: s, percentage: Math.round(percentage * 100) / 100, grade } });
});

// Add OPTIONS handler for all endpoints in this router
router.options('*', (req, res) => {
  res.sendStatus(204);
});
module.exports = router;
