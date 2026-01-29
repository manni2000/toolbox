const express = require('express');
const router = express.Router();

// EMI Calculator
router.post('/emi-calculator', (req, res) => {
  try {
    const { principal, rate, tenure } = req.body;
    
    if (!principal || !rate || !tenure) {
      return res.status(400).json({ error: 'Principal, rate, and tenure are required' });
    }

    const P = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100; // Monthly interest rate
    const n = parseInt(tenure) * 12; // Total months

    if (isNaN(P) || isNaN(r) || isNaN(n)) {
      return res.status(400).json({ error: 'Invalid numeric values' });
    }

    // EMI formula: EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - P;

    res.json({
      success: true,
      result: {
        principal: P,
        rate: parseFloat(rate),
        tenure: parseInt(tenure),
        emi,
        totalAmount,
        totalInterest,
        formattedEMI: formatCurrency(emi),
        formattedTotalAmount: formatCurrency(totalAmount),
        formattedTotalInterest: formatCurrency(totalInterest)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GST Calculator
router.post('/gst-calculator', (req, res) => {
  try {
    const { amount, gstRate, type = 'exclusive' } = req.body;
    
    if (amount === undefined || !gstRate) {
      return res.status(400).json({ error: 'Amount and GST rate are required' });
    }

    const baseAmount = parseFloat(amount);
    const rate = parseFloat(gstRate);

    if (isNaN(baseAmount) || isNaN(rate)) {
      return res.status(400).json({ error: 'Invalid numeric values' });
    }

    let gst, total, base;

    if (type === 'exclusive') {
      // GST is calculated on base amount
      base = baseAmount;
      gst = base * (rate / 100);
      total = base + gst;
    } else {
      // GST is included in total amount
      total = baseAmount;
      base = total / (1 + rate / 100);
      gst = total - base;
    }

    res.json({
      success: true,
      result: {
        base,
        gst,
        total,
        gstRate: rate,
        type,
        formattedBase: formatCurrency(base),
        formattedGST: formatCurrency(gst),
        formattedTotal: formatCurrency(total)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Salary Calculator
router.post('/salary-calculator', (req, res) => {
  try {
    const { ctc, basicPercentage = 40, hraPercentage = 40, otherPercentage = 20 } = req.body;
    
    if (!ctc) {
      return res.status(400).json({ error: 'CTC is required' });
    }

    const annualCTC = parseFloat(ctc);
    const monthlyCTC = annualCTC / 12;

    if (isNaN(annualCTC)) {
      return res.status(400).json({ error: 'Invalid CTC value' });
    }

    const basic = monthlyCTC * (basicPercentage / 100);
    const hra = monthlyCTC * (hraPercentage / 100);
    const other = monthlyCTC * (otherPercentage / 100);

    // Simplified tax calculation (this would be more complex in reality)
    const monthlyTax = calculateMonthlyTax(annualCTC);
    const monthlyPF = Math.min(basic * 0.12, 15000); // PF capped at 15000 per month
    const monthlyProfessionalTax = 200; // Varies by state
    const totalDeductions = monthlyTax + monthlyPF + monthlyProfessionalTax;
    const takeHome = monthlyCTC - totalDeductions;

    res.json({
      success: true,
      result: {
        annualCTC,
        monthlyCTC,
        basic,
        hra,
        other,
        monthlyTax,
        monthlyPF,
        monthlyProfessionalTax,
        totalDeductions,
        takeHome,
        formattedMonthlyCTC: formatCurrency(monthlyCTC),
        formattedTakeHome: formatCurrency(takeHome),
        formattedTotalDeductions: formatCurrency(totalDeductions)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Currency Converter (placeholder - would need external API)
router.post('/currency-converter', (req, res) => {
  try {
    const { amount, from, to } = req.body;
    
    if (!amount || !from || !to) {
      return res.status(400).json({ error: 'Amount, from currency, and to currency are required' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use an external API like exchangerate-api.com
    const exchangeRates = {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'JPY': 110.0,
      'INR': 74.0,
      'CAD': 1.25,
      'AUD': 1.35
    };

    const fromRate = exchangeRates[from] || 1;
    const toRate = exchangeRates[to] || 1;
    const convertedAmount = (parseFloat(amount) / fromRate) * toRate;

    res.json({
      success: true,
      result: {
        amount: parseFloat(amount),
        from,
        to,
        convertedAmount,
        exchangeRate: toRate / fromRate,
        formattedAmount: formatCurrency(convertedAmount, to),
        note: 'This is a placeholder. Implement with real exchange rate API.'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Startup Burn Rate Calculator
router.post('/burn-rate-calculator', (req, res) => {
  try {
    const { monthlyExpenses, currentCash } = req.body;
    
    if (!monthlyExpenses || !currentCash) {
      return res.status(400).json({ error: 'Monthly expenses and current cash are required' });
    }

    const expenses = parseFloat(monthlyExpenses);
    const cash = parseFloat(currentCash);

    if (isNaN(expenses) || isNaN(cash)) {
      return res.status(400).json({ error: 'Invalid numeric values' });
    }

    const runway = cash / expenses;
    const weeksRunway = runway * 4.33; // Average weeks in a month
    const daysRunway = runway * 30.44; // Average days in a month

    res.json({
      success: true,
      result: {
        monthlyExpenses: expenses,
        currentCash: cash,
        monthlyRunway: runway,
        weeksRunway,
        daysRunway,
        formattedExpenses: formatCurrency(expenses),
        formattedCash: formatCurrency(cash),
        runwayMonths: Math.floor(runway),
        runwayWeeks: Math.floor(weeksRunway),
        runwayDays: Math.floor(daysRunway)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SaaS Pricing Calculator
router.post('/saas-pricing-calculator', (req, res) => {
  try {
    const { users, monthlyPrice, annualDiscount = 20 } = req.body;
    
    if (!users || !monthlyPrice) {
      return res.status(400).json({ error: 'Number of users and monthly price are required' });
    }

    const userCount = parseInt(users);
    const pricePerUser = parseFloat(monthlyPrice);
    const discount = parseFloat(annualDiscount);

    if (isNaN(userCount) || isNaN(pricePerUser) || isNaN(discount)) {
      return res.status(400).json({ error: 'Invalid numeric values' });
    }

    const monthlyRevenue = userCount * pricePerUser;
    const annualRevenue = monthlyRevenue * 12;
    const discountedAnnualRevenue = annualRevenue * (1 - discount / 100);
    const monthlySavings = (annualRevenue - discountedAnnualRevenue) / 12;

    res.json({
      success: true,
      result: {
        users: userCount,
        monthlyPrice: pricePerUser,
        monthlyRevenue,
        annualRevenue,
        annualDiscount: discount,
        discountedAnnualRevenue,
        monthlySavings,
        formattedMonthlyRevenue: formatCurrency(monthlyRevenue),
        formattedAnnualRevenue: formatCurrency(annualRevenue),
        formattedDiscountedAnnualRevenue: formatCurrency(discountedAnnualRevenue),
        formattedMonthlySavings: formatCurrency(monthlySavings)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// EMI Comparison
router.post('/emi-comparison', (req, res) => {
  try {
    const { loans } = req.body;
    
    if (!loans || !Array.isArray(loans) || loans.length < 2) {
      return res.status(400).json({ error: 'At least 2 loans are required for comparison' });
    }

    const results = loans.map((loan, index) => {
      const { principal, rate, tenure, name = `Loan ${index + 1}` } = loan;
      
      if (!principal || !rate || !tenure) {
        throw new Error(`Loan ${index + 1} is missing required fields`);
      }

      const P = parseFloat(principal);
      const r = parseFloat(rate) / 12 / 100;
      const n = parseInt(tenure) * 12;

      const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      const totalAmount = emi * n;
      const totalInterest = totalAmount - P;

      return {
        name,
        principal: P,
        rate: parseFloat(rate),
        tenure: parseInt(tenure),
        emi,
        totalAmount,
        totalInterest,
        formattedEMI: formatCurrency(emi),
        formattedTotalAmount: formatCurrency(totalAmount),
        formattedTotalInterest: formatCurrency(totalInterest)
      };
    });

    // Sort by total interest (lowest first)
    results.sort((a, b) => a.totalInterest - b.totalInterest);

    res.json({
      success: true,
      result: {
        comparison: results,
        bestOption: results[0],
        savings: results.length > 1 ? results[results.length - 1].totalInterest - results[0].totalInterest : 0,
        formattedSavings: formatCurrency(results.length > 1 ? results[results.length - 1].totalInterest - results[0].totalInterest : 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function formatCurrency(amount, currency = 'USD') {
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'INR': '₹'
  };
  
  const symbol = symbols[currency] || '$';
  return `${symbol}${amount.toFixed(2)}`;
}

function calculateMonthlyTax(annualCTC) {
  // Simplified Indian tax calculation (for demonstration)
  // In reality, this would be much more complex with different slabs
  const taxSlabs = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.20 },
    { min: 1000000, max: Infinity, rate: 0.30 }
  ];

  let tax = 0;
  for (const slab of taxSlabs) {
    if (annualCTC > slab.min) {
      const taxableAmount = Math.min(annualCTC, slab.max) - slab.min;
      tax += taxableAmount * slab.rate;
    }
  }

  return tax / 12; // Monthly tax
}

module.exports = router;
