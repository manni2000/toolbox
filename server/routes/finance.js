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

// Invoice Generator
router.post('/invoice-generator/', (req, res) => {
  try {
    const {
      invoice_number,
      client_name,
      client_email,
      client_phone,
      client_address,
      date,
      due_date,
      tax_rate,
      currency,
      items
    } = req.body;

    if (!invoice_number || !client_name || !client_email || !items || items.length === 0) {
      return res.status(400).json({ error: 'Invoice number, client name, email, and at least one item are required' });
    }

    // Calculate totals
    const calculateSubtotal = (items) => {
      return items.reduce((sum, item) => {
        return sum + ((item.quantity * item.unit_price) * (1 - item.discount / 100));
      }, 0);
    };

    const calculateTax = (subtotal, taxRate) => {
      const rate = parseFloat(taxRate) || 0;
      return (subtotal * rate) / 100;
    };

    const subtotal = calculateSubtotal(items);
    const tax = calculateTax(subtotal, tax_rate);
    const total = subtotal + tax;

    // Format currency
    const formatCurrency = (amount, currency = 'USD') => {
      const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'INR': '₹',
        'AED': 'د.إ',
        'PKR': '₨',
        'NPR': '₨',
        'LKR': 'රු',
        'BDT': '৳',
        'CNY': '¥',
        'AUD': 'A$',
        'CAD': 'C$',
        'SGD': 'S$',
        'MYR': 'RM'
      };
      
      const symbol = symbols[currency] || '$';
      return `${symbol}${amount.toFixed(2)}`;
    };

    // Generate HTML for invoice
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice_number}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
        }
        
        /* Responsive breakpoints */
        @media (max-width: 768px) {
          body {
            padding: 10px;
            font-size: 14px;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .header p {
            font-size: 16px;
          }
          
          .invoice-details {
            flex-direction: column;
            gap: 15px;
          }
          
          .client-info, .invoice-info {
            flex: none;
            width: 100%;
          }
          
          .items-table {
            font-size: 12px;
            overflow-x: auto;
            display: block;
            white-space: nowrap;
          }
          
          .items-table th,
          .items-table td {
            padding: 8px 6px;
            min-width: 80px;
          }
          
          .totals {
            text-align: left;
            padding: 12px;
          }
          
          .totals div {
            font-size: 14px;
            margin-bottom: 8px;
          }
          
          .totals .total {
            font-size: 18px;
          }
          
          .print-btn {
            width: 100%;
            padding: 12px;
            font-size: 16px;
          }
        }
        
        @media (max-width: 480px) {
          body {
            padding: 5px;
            font-size: 12px;
          }
          
          .header h1 {
            font-size: 20px;
          }
          
          .header {
            margin-bottom: 20px;
            padding-bottom: 15px;
          }
          
          .info-group {
            margin-bottom: 10px;
          }
          
          .items-table th,
          .items-table td {
            padding: 6px 4px;
            min-width: 70px;
          }
          
          .totals {
            padding: 10px;
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            font-size: 12px;
          }
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.6;
          box-sizing: border-box;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        
        .header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 28px;
        }
        
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .client-info, .invoice-info {
          flex: 1;
          min-width: 250px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
        }
        
        .info-group {
          margin-bottom: 15px;
        }
        
        .info-group strong {
          display: block;
          margin-bottom: 5px;
          color: #2c3e50;
          font-size: 14px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .items-table th,
        .items-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        
        .items-table th {
          background-color: #f8f9fa;
          font-weight: bold;
          font-size: 14px;
          position: sticky;
          top: 0;
        }
        
        .items-table .text-right {
          text-align: right;
        }
        
        .totals {
          text-align: right;
          margin-top: 20px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          max-width: 300px;
          margin-left: auto;
        }
        
        .totals div {
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .totals .total {
          font-size: 20px;
          font-weight: bold;
          color: #2c3e50;
          border-top: 2px solid #333;
          padding-top: 10px;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        
        .print-btn {
          background: #007bff;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin-bottom: 20px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        
        .print-btn:hover {
          background: #0056b3;
        }
        
        /* Ensure table doesn't break layout */
        .items-table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: center; margin-bottom: 20px;">
        <button class="print-btn" onclick="window.print()">🖨️ Print to PDF</button>
        <p style="color: #666; font-size: 14px;">Click the button above and select "Save as PDF" in the print dialog</p>
      </div>

      <div class="header">
        <h1>INVOICE</h1>
        <p style="font-size: 18px; margin: 5px 0;">Invoice #${invoice_number}</p>
      </div>

      <div class="invoice-details">
        <div class="client-info">
          <div class="info-group">
            <strong>Bill To:</strong>
            <div style="font-size: 16px; font-weight: bold;">${client_name}</div>
            <div>${client_email}</div>
            ${client_phone ? `<div>${client_phone}</div>` : ''}
            ${client_address ? `<div>${client_address}</div>` : ''}
          </div>
        </div>
        <div class="invoice-info">
          <div class="info-group">
            <strong>Invoice Details:</strong>
            <div><strong>Date:</strong> ${date || 'N/A'}</div>
            <div><strong>Due Date:</strong> ${due_date || 'N/A'}</div>
            <div><strong>Currency:</strong> ${currency}</div>
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 35%;">Description</th>
            <th class="text-right" style="width: 10%;">Quantity</th>
            <th class="text-right" style="width: 15%;">Unit Price</th>
            <th class="text-right" style="width: 15%;">Gross Amount</th>
            <th class="text-right" style="width: 10%;">Discount</th>
            <th class="text-right" style="width: 15%;">Net Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const grossAmount = item.quantity * item.unit_price;
            const discountAmount = grossAmount * (item.discount / 100);
            const netTotal = grossAmount - discountAmount;
            return `
              <tr>
                <td>${item.description}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unit_price, currency)}</td>
                <td class="text-right">${formatCurrency(grossAmount, currency)}</td>
                <td class="text-right">${item.discount > 0 ? `${item.discount}%<br><small>-${formatCurrency(discountAmount, currency)}</small>` : '-'}</td>
                <td class="text-right" style="font-weight: bold;">${formatCurrency(netTotal, currency)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div><strong>Subtotal:</strong> ${formatCurrency(subtotal, currency)}</div>
        ${parseFloat(tax_rate) > 0 ? `<div><strong>Tax (${tax_rate}%):</strong> ${formatCurrency(tax, currency)}</div>` : ''}
        <div class="total"><strong>Total:</strong> ${formatCurrency(total, currency)}</div>
      </div>

      <div class="footer">
        <p><strong>Thank you for your business!</strong></p>
        <p>This is a computer-generated invoice.</p>
      </div>
    </body>
    </html>
    `;

    // Set response headers for HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
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
