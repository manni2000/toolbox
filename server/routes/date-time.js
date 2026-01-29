const express = require('express');
const moment = require('moment-timezone');
const router = express.Router();

// Date difference calculator
router.post('/date-difference', (req, res) => {
  try {
    const { startDate, endDate, includeTime = false } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = moment(startDate);
    const end = moment(endDate);

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const duration = moment.duration(end.diff(start));
    
    const result = {
      years: duration.years(),
      months: duration.months(),
      days: duration.days(),
      hours: includeTime ? duration.hours() : 0,
      minutes: includeTime ? duration.minutes() : 0,
      seconds: includeTime ? duration.seconds() : 0,
      totalDays: duration.asDays(),
      totalHours: duration.asHours(),
      totalMinutes: duration.asMinutes(),
      totalSeconds: duration.asSeconds()
    };

    res.json({
      success: true,
      result
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Working days calculator
router.post('/working-days', (req, res) => {
  try {
    const { startDate, endDate, holidays = [] } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const start = moment(startDate);
    const end = moment(endDate);

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    let workingDays = 0;
    let weekends = 0;
    let holidayCount = 0;
    const current = start.clone();

    while (current.isSameOrBefore(end, 'day')) {
      const dayOfWeek = current.day();
      const dateString = current.format('YYYY-MM-DD');
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekends++;
      } else if (holidays.includes(dateString)) {
        holidayCount++;
      } else {
        workingDays++;
      }
      
      current.add(1, 'day');
    }

    res.json({
      success: true,
      result: {
        workingDays,
        weekends,
        holidays: holidayCount,
        totalDays: workingDays + weekends + holidayCount,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD')
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Countdown timer
router.post('/countdown', (req, res) => {
  try {
    const { targetDate, timezone = 'UTC' } = req.body;
    
    if (!targetDate) {
      return res.status(400).json({ error: 'Target date is required' });
    }

    const target = moment.tz(targetDate, timezone);
    const now = moment.tz(timezone);

    if (!target.isValid()) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (target.isBefore(now)) {
      return res.status(400).json({ error: 'Target date must be in the future' });
    }

    const duration = moment.duration(target.diff(now));
    
    const result = {
      days: Math.floor(duration.asDays()),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds(),
      totalSeconds: Math.floor(duration.asSeconds()),
      targetDate: target.format('YYYY-MM-DD HH:mm:ss'),
      timezone: timezone,
      currentDate: now.format('YYYY-MM-DD HH:mm:ss')
    };

    res.json({
      success: true,
      result
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// World time
router.get('/world-time', (req, res) => {
  try {
    const { timezone } = req.query;
    
    if (timezone) {
      // Get time for specific timezone
      const time = moment.tz(timezone);
      if (!time.isValid()) {
        return res.status(400).json({ error: 'Invalid timezone' });
      }

      res.json({
        success: true,
        timezone: timezone,
        time: time.format('YYYY-MM-DD HH:mm:ss'),
        date: time.format('YYYY-MM-DD'),
        timeOnly: time.format('HH:mm:ss'),
        dayOfWeek: time.format('dddd'),
        utcOffset: time.utcOffset()
      });
    } else {
      // Get time for major timezones
      const timezones = [
        'America/New_York',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Australia/Sydney',
        'UTC'
      ];

      const results = timezones.map(tz => {
        const time = moment.tz(tz);
        return {
          timezone: tz,
          time: time.format('YYYY-MM-DD HH:mm:ss'),
          date: time.format('YYYY-MM-DD'),
          timeOnly: time.format('HH:mm:ss'),
          dayOfWeek: time.format('dddd'),
          utcOffset: time.utcOffset()
        };
      });

      res.json({
        success: true,
        results
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Age calculator
router.post('/age-calculator', (req, res) => {
  try {
    const { birthDate, currentDate } = req.body;
    
    if (!birthDate) {
      return res.status(400).json({ error: 'Birth date is required' });
    }

    const birth = moment(birthDate);
    const current = currentDate ? moment(currentDate) : moment();

    if (!birth.isValid() || !current.isValid()) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (birth.isAfter(current)) {
      return res.status(400).json({ error: 'Birth date cannot be in the future' });
    }

    const duration = moment.duration(current.diff(birth));
    
    const result = {
      years: Math.floor(duration.asYears()),
      months: Math.floor(duration.asMonths()),
      days: Math.floor(duration.asDays()),
      weeks: Math.floor(duration.asWeeks()),
      totalDays: Math.floor(duration.asDays()),
      totalHours: Math.floor(duration.asHours()),
      totalMinutes: Math.floor(duration.asMinutes()),
      birthDate: birth.format('YYYY-MM-DD'),
      currentDate: current.format('YYYY-MM-DD'),
      nextBirthday: birth.clone().year(current.year()).isAfter(current) 
        ? birth.clone().year(current.year()).format('YYYY-MM-DD')
        : birth.clone().year(current.year() + 1).format('YYYY-MM-DD'),
      zodiacSign: getZodiacSign(birth.date(), birth.month() + 1)
    };

    res.json({
      success: true,
      result
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to get zodiac sign
function getZodiacSign(day, month) {
  const zodiacSigns = [
    { name: 'Capricorn', start: [12, 22], end: [1, 19] },
    { name: 'Aquarius', start: [1, 20], end: [2, 18] },
    { name: 'Pisces', start: [2, 19], end: [3, 20] },
    { name: 'Aries', start: [3, 21], end: [4, 19] },
    { name: 'Taurus', start: [4, 20], end: [5, 20] },
    { name: 'Gemini', start: [5, 21], end: [6, 20] },
    { name: 'Cancer', start: [6, 21], end: [7, 22] },
    { name: 'Leo', start: [7, 23], end: [8, 22] },
    { name: 'Virgo', start: [8, 23], end: [9, 22] },
    { name: 'Libra', start: [9, 23], end: [10, 22] },
    { name: 'Scorpio', start: [10, 23], end: [11, 21] },
    { name: 'Sagittarius', start: [11, 22], end: [12, 21] }
  ];

  for (const sign of zodiacSigns) {
    if ((month === sign.start[0] && day >= sign.start[1]) || 
        (month === sign.end[0] && day <= sign.end[1])) {
      return sign.name;
    }
  }

  return 'Unknown';
}

module.exports = router;
