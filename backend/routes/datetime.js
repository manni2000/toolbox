const express = require('express');
const { strictLimiter } = require('../middleware/security');

const router = express.Router();
router.use(strictLimiter);

router.post('/date-difference', (req, res) => {
  const { startDate, endDate } = req.body;
  if (!startDate || !endDate) return res.status(400).json({ success: false, error: 'Start and end dates required' });

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) return res.status(400).json({ success: false, error: 'Invalid date format' });

  const diffMs = Math.abs(end - start);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.abs((end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor(diffMs / (1000 * 60));

  res.json({ success: true, result: { startDate, endDate, days, weeks, months, years, hours, minutes, isAfter: end > start } });
});

router.post('/age-calculator', (req, res) => {
  const { birthDate, currentDate } = req.body;
  if (!birthDate) return res.status(400).json({ success: false, error: 'Birth date required' });

  const birth = new Date(birthDate);
  const now = currentDate ? new Date(currentDate) : new Date();
  if (isNaN(birth)) return res.status(400).json({ success: false, error: 'Invalid birth date' });

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) { months--; const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); days += prevMonth.getDate(); }
  if (months < 0) { years--; months += 12; }

  const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBirthday < now) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
  const daysToNextBirthday = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24));

  const totalDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));

  res.json({ success: true, result: { years, months, days, totalDays, totalWeeks: Math.floor(totalDays / 7), totalMonths: years * 12 + months, daysToNextBirthday, birthDate, calculatedAt: now.toISOString() } });
});

router.post('/working-days', (req, res) => {
  const { startDate, endDate, holidays = [] } = req.body;
  if (!startDate || !endDate) return res.status(400).json({ success: false, error: 'Start and end dates required' });

  const start = new Date(startDate);
  const end = new Date(endDate);
  const holidaySet = new Set(Array.isArray(holidays) ? holidays : []);

  let workingDays = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split('T')[0];
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(dateStr)) workingDays++;
    current.setDate(current.getDate() + 1);
  }

  const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const weekends = totalDays - workingDays - holidaySet.size;

  res.json({ success: true, result: { startDate, endDate, workingDays, totalDays, weekends, holidays: holidaySet.size } });
});

router.post('/countdown', (req, res) => {
  const { targetDate, timezone } = req.body;
  if (!targetDate) return res.status(400).json({ success: false, error: 'Target date required' });

  const target = new Date(targetDate);
  const now = new Date();
  const diff = target - now;

  if (diff < 0) return res.json({ success: true, result: { expired: true, message: 'Event has passed', targetDate } });

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  res.json({ success: true, result: { targetDate, currentTime: now.toISOString(), days, hours, minutes, seconds, totalSeconds: Math.floor(diff / 1000), expired: false } });
});

router.get('/world-time', (req, res) => {
  const { timezone } = req.query;

  const popularZones = ['America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Dubai', 'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland'];

  const zones = timezone ? [timezone] : popularZones;
  const times = zones.map(tz => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, dateStyle: 'full', timeStyle: 'long' });
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date());
      const obj = {};
      parts.forEach(p => { obj[p.type] = p.value; });
      return { timezone: tz, formatted: formatter.format(new Date()), time: `${obj.hour}:${obj.minute}:${obj.second}`, date: `${obj.year}-${obj.month}-${obj.day}` };
    } catch {
      return { timezone: tz, error: 'Invalid timezone' };
    }
  });

  res.json({ success: true, result: { times, serverTime: new Date().toISOString() } });
});

module.exports = router;
