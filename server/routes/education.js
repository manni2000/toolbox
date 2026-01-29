const express = require('express');
const router = express.Router();

// Scientific calculator
router.post('/scientific-calculator', (req, res) => {
  try {
    const { expression } = req.body;
    
    if (!expression) {
      return res.status(400).json({ error: 'Expression is required' });
    }

    try {
      // Safe evaluation of mathematical expressions
      // Note: In production, you might want to use a proper math library like mathjs
      const result = evaluateMathExpression(expression);
      
      res.json({
        success: true,
        result: {
          expression,
          result,
          formatted: formatNumber(result)
        }
      });
    } catch (evalError) {
      res.status(400).json({
        success: false,
        error: 'Invalid expression',
        message: evalError.message
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Percentage calculator
router.post('/percentage-calculator', (req, res) => {
  try {
    const { type, value1, value2 } = req.body;
    
    if (!type || value1 === undefined || value2 === undefined) {
      return res.status(400).json({ error: 'Type and both values are required' });
    }

    let result;
    
    switch (type) {
      case 'percentage':
        // What is X% of Y?
        result = (value1 * value2) / 100;
        break;
      case 'what_percentage':
        // X is what % of Y?
        result = (value1 / value2) * 100;
        break;
      case 'percentage_change':
        // Percentage change from X to Y
        result = ((value2 - value1) / value1) * 100;
        break;
      case 'increase_by_percentage':
        // Increase X by Y%
        result = value1 * (1 + value2 / 100);
        break;
      case 'decrease_by_percentage':
        // Decrease X by Y%
        result = value1 * (1 - value2 / 100);
        break;
      default:
        return res.status(400).json({ error: 'Invalid calculation type' });
    }

    res.json({
      success: true,
      result: {
        type,
        value1,
        value2,
        result,
        formatted: formatNumber(result)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unit converter
router.post('/unit-converter', (req, res) => {
  try {
    const { category, from, to, value } = req.body;
    
    if (!category || !from || !to || value === undefined) {
      return res.status(400).json({ error: 'Category, from unit, to unit, and value are required' });
    }

    const conversions = {
      length: {
        'meter': 1,
        'kilometer': 0.001,
        'centimeter': 100,
        'millimeter': 1000,
        'mile': 0.000621371,
        'yard': 1.09361,
        'foot': 3.28084,
        'inch': 39.3701
      },
      weight: {
        'kilogram': 1,
        'gram': 1000,
        'milligram': 1000000,
        'pound': 2.20462,
        'ounce': 35.274,
        'ton': 0.001
      },
      temperature: {
        'celsius': 'celsius',
        'fahrenheit': 'fahrenheit',
        'kelvin': 'kelvin'
      },
      volume: {
        'liter': 1,
        'milliliter': 1000,
        'gallon': 0.264172,
        'quart': 1.05669,
        'pint': 2.11338,
        'cup': 4.22675,
        'fluid_ounce': 33.814
      }
    };

    if (!conversions[category]) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    let result;
    
    if (category === 'temperature') {
      result = convertTemperature(value, from, to);
    } else {
      if (!conversions[category][from] || !conversions[category][to]) {
        return res.status(400).json({ error: 'Invalid unit for this category' });
      }
      
      // Convert to base unit first, then to target unit
      const baseValue = value / conversions[category][from];
      result = baseValue * conversions[category][to];
    }

    res.json({
      success: true,
      result: {
        category,
        from,
        to,
        value,
        result,
        formatted: formatNumber(result)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compound interest calculator
router.post('/compound-interest', (req, res) => {
  try {
    const { principal, rate, time, compoundFrequency = 12 } = req.body;
    
    if (principal === undefined || rate === undefined || time === undefined) {
      return res.status(400).json({ error: 'Principal, rate, and time are required' });
    }

    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100; // Convert percentage to decimal
    const n = parseInt(compoundFrequency);
    const t = parseFloat(time);

    if (isNaN(P) || isNaN(r) || isNaN(n) || isNaN(t)) {
      return res.status(400).json({ error: 'Invalid numeric values' });
    }

    // Compound interest formula: A = P(1 + r/n)^(nt)
    const amount = P * Math.pow(1 + r/n, n * t);
    const interest = amount - P;

    res.json({
      success: true,
      result: {
        principal: P,
        rate: parseFloat(rate),
        time: t,
        compoundFrequency: n,
        amount,
        interest,
        formattedAmount: formatNumber(amount),
        formattedInterest: formatNumber(interest)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple interest calculator
router.post('/simple-interest', (req, res) => {
  try {
    const { principal, rate, time } = req.body;
    
    if (principal === undefined || rate === undefined || time === undefined) {
      return res.status(400).json({ error: 'Principal, rate, and time are required' });
    }

    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100; // Convert percentage to decimal
    const t = parseFloat(time);

    if (isNaN(P) || isNaN(r) || isNaN(t)) {
      return res.status(400).json({ error: 'Invalid numeric values' });
    }

    // Simple interest formula: I = P * r * t
    const interest = P * r * t;
    const amount = P + interest;

    res.json({
      success: true,
      result: {
        principal: P,
        rate: parseFloat(rate),
        time: t,
        interest,
        amount,
        formattedInterest: formatNumber(interest),
        formattedAmount: formatNumber(amount)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CGPA to percentage converter
router.post('/cgpa-to-percentage', (req, res) => {
  try {
    const { cgpa, scale = 10 } = req.body;
    
    if (cgpa === undefined) {
      return res.status(400).json({ error: 'CGPA is required' });
    }

    const cgpaValue = parseFloat(cgpa);
    
    if (isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > scale) {
      return res.status(400).json({ error: `Invalid CGPA value. Must be between 0 and ${scale}` });
    }

    // Common conversion formulas
    let percentage;
    if (scale === 10) {
      percentage = cgpaValue * 9.5; // Common formula for 10-point scale
    } else if (scale === 4) {
      percentage = cgpaValue * 25; // Common formula for 4-point scale
    } else if (scale === 5) {
      percentage = cgpaValue * 20; // Common formula for 5-point scale
    } else {
      percentage = (cgpaValue / scale) * 100; // Generic formula
    }

    res.json({
      success: true,
      result: {
        cgpa: cgpaValue,
        scale,
        percentage,
        formattedPercentage: formatNumber(percentage) + '%'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LCM and HCF calculator
router.post('/lcm-hcf', (req, res) => {
  try {
    const { numbers } = req.body;
    
    if (!numbers || !Array.isArray(numbers) || numbers.length < 2) {
      return res.status(400).json({ error: 'At least 2 numbers are required' });
    }

    const validNumbers = numbers.map(n => parseInt(n)).filter(n => !isNaN(n) && n > 0);
    
    if (validNumbers.length < 2) {
      return res.status(400).json({ error: 'At least 2 valid positive numbers are required' });
    }

    const hcf = calculateHCF(validNumbers);
    const lcm = calculateLCM(validNumbers);

    res.json({
      success: true,
      result: {
        numbers: validNumbers,
        hcf,
        lcm
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Study timetable generator
router.post('/study-timetable', (req, res) => {
  try {
    const { subjects, hoursPerDay, daysPerWeek = 7 } = req.body;
    
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'Subjects array is required' });
    }

    if (!hoursPerDay || hoursPerDay < 1 || hoursPerDay > 24) {
      return res.status(400).json({ error: 'Valid hours per day is required (1-24)' });
    }

    const timetable = generateTimetable(subjects, hoursPerDay, daysPerWeek);

    res.json({
      success: true,
      result: {
        subjects,
        hoursPerDay,
        daysPerWeek,
        timetable
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MCQ generator
router.post('/mcq-generator', (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 5 } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use a proper question generation service
    const mcqs = generateSampleMCQs(topic, difficulty, count);

    res.json({
      success: true,
      result: {
        topic,
        difficulty,
        count,
        questions: mcqs
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function evaluateMathExpression(expression) {
  // Safe math evaluation - only allow mathematical operations
  const sanitized = expression.replace(/[^0-9+\-*/().\s^]/g, '');
  
  // Replace math functions
  const processed = sanitized
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/sqrt/g, 'Math.sqrt')
    .replace(/log/g, 'Math.log')
    .replace(/pi/g, 'Math.PI')
    .replace(/e/g, 'Math.E')
    .replace(/\^/g, '**');

  return Function('"use strict"; return (' + processed + ')')();
}

function formatNumber(num) {
  if (isNaN(num)) return 'Invalid';
  return Number(num.toFixed(6)).toString();
}

function convertTemperature(value, from, to) {
  let celsius;
  
  // Convert to Celsius first
  if (from === 'celsius') {
    celsius = value;
  } else if (from === 'fahrenheit') {
    celsius = (value - 32) * 5/9;
  } else if (from === 'kelvin') {
    celsius = value - 273.15;
  }

  // Convert from Celsius to target
  if (to === 'celsius') {
    return celsius;
  } else if (to === 'fahrenheit') {
    return celsius * 9/5 + 32;
  } else if (to === 'kelvin') {
    return celsius + 273.15;
  }
}

function calculateHCF(numbers) {
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  return numbers.reduce((acc, num) => gcd(acc, num));
}

function calculateLCM(numbers) {
  const lcm = (a, b) => (a * b) / calculateHCF([a, b]);
  return numbers.reduce((acc, num) => lcm(acc, num));
}

function generateTimetable(subjects, hoursPerDay, daysPerWeek) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timetable = {};
  
  for (let i = 0; i < daysPerWeek; i++) {
    timetable[days[i]] = [];
    let remainingHours = hoursPerDay;
    
    for (const subject of subjects) {
      if (remainingHours <= 0) break;
      
      const hours = Math.min(subject.hoursPerWeek || 2, remainingHours);
      timetable[days[i]].push({
        subject: subject.name,
        hours: hours,
        startTime: `${9 + (hoursPerDay - remainingHours)}:00`,
        endTime: `${9 + (hoursPerDay - remainingHours) + hours}:00`
      });
      
      remainingHours -= hours;
    }
  }
  
  return timetable;
}

function generateSampleMCQs(topic, difficulty, count) {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    questions.push({
      id: i + 1,
      question: `Sample question ${i + 1} about ${topic}`,
      options: [
        `Option A for question ${i + 1}`,
        `Option B for question ${i + 1}`,
        `Option C for question ${i + 1}`,
        `Option D for question ${i + 1}`
      ],
      correctAnswer: Math.floor(Math.random() * 4) + 1,
      explanation: `Explanation for question ${i + 1}`,
      difficulty: difficulty
    });
  }
  
  return questions;
}

module.exports = router;
