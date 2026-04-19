const express = require('express');
const fetch = require('node-fetch');
const { strictLimiter } = require('../middleware/security');

const router = express.Router();
router.use(strictLimiter);

router.post('/emi-calculator', (req, res) => {
  const { principal, rate, tenure, tenureType = 'months' } = req.body;
  if (!principal || !rate || !tenure) return res.status(400).json({ success: false, error: 'Principal, rate, and tenure required' });

  const P = parseFloat(principal);
  const annualRate = parseFloat(rate);
  const months = tenureType === 'years' ? parseInt(tenure) * 12 : parseInt(tenure);
  const r = annualRate / (12 * 100);

  const emi = r === 0 ? P / months : (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - P;

  const schedule = [];
  let balance = P;
  for (let i = 1; i <= Math.min(months, 360); i++) {
    const interest = balance * r;
    const principalPart = emi - interest;
    balance -= principalPart;
    schedule.push({ month: i, emi: Math.round(emi), principal: Math.round(principalPart), interest: Math.round(interest), balance: Math.max(0, Math.round(balance)) });
  }

  res.json({ success: true, result: { emi: Math.round(emi * 100) / 100, totalPayment: Math.round(totalPayment), totalInterest: Math.round(totalInterest), principal: P, schedule } });
});

router.post('/emi-comparison', (req, res) => {
  const { principal, tenure, tenureType = 'years', rates = [] } = req.body;
  if (!principal || !tenure || !rates.length) return res.status(400).json({ success: false, error: 'Principal, tenure, and rates required' });

  const P = parseFloat(principal);
  const months = tenureType === 'years' ? parseInt(tenure) * 12 : parseInt(tenure);

  const comparison = rates.map(rate => {
    const r = parseFloat(rate) / (12 * 100);
    const emi = r === 0 ? P / months : (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - P;
    return { rate: parseFloat(rate), emi: Math.round(emi), totalPayment: Math.round(totalPayment), totalInterest: Math.round(totalInterest) };
  });

  res.json({ success: true, result: { principal: P, months, comparison } });
});

router.post('/currency-converter', async (req, res, next) => {
  try {
    const { amount, from = 'USD', to = 'EUR' } = req.body;
    if (!amount) return res.status(400).json({ success: false, error: 'Amount required' });

    const fromCurr = from.toUpperCase();
    const toCurr = to.toUpperCase();

    const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurr}`, { timeout: 8000 });
    const data = await response.json();

    if (data.result !== 'success') throw new Error('Currency data unavailable');

    const rate = data.rates[toCurr];
    if (!rate) return res.status(400).json({ success: false, error: `Currency ${toCurr} not found` });

    const converted = parseFloat(amount) * rate;
    res.json({
      success: true,
      result: { from: fromCurr, to: toCurr, amount: parseFloat(amount), rate, converted: Math.round(converted * 100) / 100, updated: data.time_last_update_utc },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/gst-calculator', (req, res) => {
  const { amount, gstRate, type = 'exclusive' } = req.body;
  if (!amount || !gstRate) return res.status(400).json({ success: false, error: 'Amount and GST rate required' });

  const amt = parseFloat(amount);
  const rate = parseFloat(gstRate) / 100;

  if (type === 'exclusive') {
    const gstAmount = amt * rate;
    const total = amt + gstAmount;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    res.json({ success: true, result: { original: amt, gstAmount, cgst, sgst, igst: gstAmount, total, type: 'exclusive' } });
  } else {
    const original = amt / (1 + rate);
    const gstAmount = amt - original;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    res.json({ success: true, result: { original: Math.round(original * 100) / 100, gstAmount: Math.round(gstAmount * 100) / 100, cgst: Math.round(cgst * 100) / 100, sgst: Math.round(sgst * 100) / 100, igst: Math.round(gstAmount * 100) / 100, total: amt, type: 'inclusive' } });
  }
});

router.post('/profit-margin', (req, res) => {
  const { cost, revenue, sellingPrice } = req.body;
  const r = revenue || sellingPrice;
  if (!cost || !r) return res.status(400).json({ success: false, error: 'Cost and revenue required' });

  const c = parseFloat(cost);
  const rev = parseFloat(r);
  const profit = rev - c;
  const margin = (profit / rev) * 100;
  const markup = (profit / c) * 100;

  res.json({ success: true, result: { cost: c, revenue: rev, profit: Math.round(profit * 100) / 100, grossMargin: Math.round(margin * 100) / 100, markup: Math.round(markup * 100) / 100 } });
});

router.post('/salary-calculator', (req, res) => {
  const { grossSalary, frequency = 'annual' } = req.body;
  if (!grossSalary) return res.status(400).json({ success: false, error: 'Salary required' });

  let annual = parseFloat(grossSalary);
  if (frequency === 'monthly') annual *= 12;
  else if (frequency === 'weekly') annual *= 52;
  else if (frequency === 'hourly') annual *= 2080;

  const monthly = annual / 12;
  const weekly = annual / 52;
  const daily = annual / 260;
  const hourly = annual / 2080;

  res.json({ success: true, result: { annual: Math.round(annual), monthly: Math.round(monthly), weekly: Math.round(weekly), daily: Math.round(daily), hourly: Math.round(hourly * 100) / 100 } });
});

router.post('/salary-breakup-generator', (req, res) => {
  const { ctc, city = 'metro' } = req.body;
  if (!ctc) return res.status(400).json({ success: false, error: 'CTC required' });

  const annual = parseFloat(ctc);
  const monthly = annual / 12;

  const basic = monthly * 0.4;
  const hra = city === 'metro' ? basic * 0.5 : basic * 0.4;
  const specialAllowance = monthly * 0.3;
  const conveyance = Math.min(1600, monthly * 0.05);
  const medical = Math.min(1250, monthly * 0.02);
  const providentFund = basic * 0.12;
  const professionalTax = monthly > 25000 ? 200 : 0;
  const incomeTax = estimateTax(annual);

  const grossMonthly = basic + hra + specialAllowance + conveyance + medical;
  const deductions = providentFund + professionalTax + incomeTax / 12;
  const netMonthly = grossMonthly - deductions;

  res.json({
    success: true,
    result: {
      annual,
      monthly: Math.round(monthly),
      breakdown: {
        earnings: { basic: Math.round(basic), hra: Math.round(hra), specialAllowance: Math.round(specialAllowance), conveyance: Math.round(conveyance), medical: Math.round(medical), total: Math.round(grossMonthly) },
        deductions: { providentFund: Math.round(providentFund), professionalTax, incomeTaxMonthly: Math.round(incomeTax / 12), total: Math.round(deductions) },
        netMonthly: Math.round(netMonthly),
        netAnnual: Math.round(netMonthly * 12),
      }
    }
  });
});

function estimateTax(annual) {
  let tax = 0;
  if (annual <= 250000) tax = 0;
  else if (annual <= 500000) tax = (annual - 250000) * 0.05;
  else if (annual <= 750000) tax = 12500 + (annual - 500000) * 0.1;
  else if (annual <= 1000000) tax = 37500 + (annual - 750000) * 0.15;
  else if (annual <= 1250000) tax = 75000 + (annual - 1000000) * 0.2;
  else if (annual <= 1500000) tax = 125000 + (annual - 1250000) * 0.25;
  else tax = 187500 + (annual - 1500000) * 0.3;
  return tax;
}

router.post('/compound-interest', (req, res) => {
  const { principal, rate, time, compoundFrequency = 12 } = req.body;
  if (!principal || !rate || !time) return res.status(400).json({ success: false, error: 'Principal, rate, and time required' });

  const P = parseFloat(principal);
  const r = parseFloat(rate) / 100;
  const t = parseFloat(time);
  const n = parseInt(compoundFrequency);

  const amount = P * Math.pow(1 + r / n, n * t);
  const interest = amount - P;

  res.json({ success: true, result: { principal: P, amount: Math.round(amount * 100) / 100, interest: Math.round(interest * 100) / 100, rate: parseFloat(rate), time: t } });
});

router.post('/burn-rate-calculator', (req, res) => {
  const { monthlyExpenses = [], monthlyRevenue = 0, cashBalance = 0 } = req.body;

  const totalExpenses = Array.isArray(monthlyExpenses)
    ? monthlyExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0)
    : parseFloat(monthlyExpenses) || 0;

  const revenue = parseFloat(monthlyRevenue) || 0;
  const balance = parseFloat(cashBalance) || 0;
  const netBurn = totalExpenses - revenue;
  const runway = netBurn > 0 ? balance / netBurn : null;

  res.json({
    success: true,
    result: {
      grossBurn: Math.round(totalExpenses),
      revenue: Math.round(revenue),
      netBurn: Math.round(netBurn),
      cashBalance: balance,
      runwayMonths: runway ? Math.round(runway * 10) / 10 : null,
      runwayDate: runway ? new Date(Date.now() + runway * 30 * 24 * 3600 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null,
    }
  });
});

router.post('/saas-pricing-calculator', (req, res) => {
  const { mrr = 0, churnRate = 5, cac = 0, avgContractValue = 0, growthRate = 10 } = req.body;
  const mrrVal = parseFloat(mrr);
  const churn = parseFloat(churnRate) / 100;
  const cacVal = parseFloat(cac);
  const acv = parseFloat(avgContractValue);
  const growth = parseFloat(growthRate) / 100;

  const arr = mrrVal * 12;
  const ltv = churn > 0 ? (acv || mrrVal) / churn : null;
  const ltvCacRatio = ltv && cacVal ? ltv / cacVal : null;
  const paybackMonths = cacVal && mrrVal ? cacVal / mrrVal : null;
  const projectedMrr = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    mrr: Math.round(mrrVal * Math.pow(1 + growth / 12, i + 1)),
  }));

  res.json({
    success: true,
    result: { mrr: mrrVal, arr, churnRate: parseFloat(churnRate), ltv: ltv ? Math.round(ltv) : null, cac: cacVal, ltvCacRatio: ltvCacRatio ? Math.round(ltvCacRatio * 10) / 10 : null, paybackMonths: paybackMonths ? Math.round(paybackMonths * 10) / 10 : null, projectedMrr }
  });
});

router.post('/freelancer-rate-calculator', (req, res) => {
  const { annualIncome, weeklyHours = 40, weeksOff = 4, businessExpenses = 0, taxRate = 30, billablePercent = 70 } = req.body;
  if (!annualIncome) return res.status(400).json({ success: false, error: 'Annual income required' });

  const income = parseFloat(annualIncome);
  const expenses = parseFloat(businessExpenses);
  const taxes = parseFloat(taxRate) / 100;
  const billable = parseFloat(billablePercent) / 100;
  const weeksWork = 52 - parseInt(weeksOff);
  const hoursPerWeek = parseFloat(weeklyHours);
  const billableHours = weeksWork * hoursPerWeek * billable;

  const grossNeeded = (income + expenses) / (1 - taxes);
  const hourlyRate = billableHours > 0 ? grossNeeded / billableHours : 0;
  const dailyRate = hourlyRate * 8;
  const weeklyRate = hourlyRate * hoursPerWeek * billable;
  const monthlyRate = grossNeeded / 12;

  res.json({
    success: true,
    result: {
      hourlyRate: Math.round(hourlyRate),
      dailyRate: Math.round(dailyRate),
      weeklyRate: Math.round(weeklyRate),
      monthlyRate: Math.round(monthlyRate),
      annualGross: Math.round(grossNeeded),
      billableHoursPerYear: Math.round(billableHours),
    }
  });
});

router.post('/budget-planner', (req, res) => {
  const { monthlyIncome = 0, expenses = [] } = req.body;
  const income = parseFloat(monthlyIncome) || 0;

  const categorized = {};
  let totalExpenses = 0;

  (Array.isArray(expenses) ? expenses : []).forEach(e => {
    const cat = e.category || 'Other';
    const amt = parseFloat(e.amount) || 0;
    categorized[cat] = (categorized[cat] || 0) + amt;
    totalExpenses += amt;
  });

  const savings = income - totalExpenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const recommended = {
    needs: income * 0.5,
    wants: income * 0.3,
    savings: income * 0.2,
  };

  res.json({
    success: true,
    result: {
      monthlyIncome: income,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      categories: categorized,
      recommended,
      status: savingsRate >= 20 ? 'healthy' : savingsRate >= 10 ? 'moderate' : 'needs_improvement',
    }
  });
});

router.post('/stock-cagr-calculator', (req, res) => {
  const { initialValue, finalValue, years, initialDate, finalDate } = req.body;

  let iv = parseFloat(initialValue);
  let fv = parseFloat(finalValue);
  let n = parseFloat(years);

  if (initialDate && finalDate && !years) {
    const d1 = new Date(initialDate);
    const d2 = new Date(finalDate);
    n = (d2 - d1) / (365.25 * 24 * 3600 * 1000);
  }

  if (!iv || !fv || !n) return res.status(400).json({ success: false, error: 'Initial value, final value, and period required' });

  const cagr = (Math.pow(fv / iv, 1 / n) - 1) * 100;
  const absoluteReturn = ((fv - iv) / iv) * 100;

  const projections = Array.from({ length: Math.ceil(n) + 3 }, (_, i) => ({
    year: i,
    value: Math.round(iv * Math.pow(1 + cagr / 100, i)),
  }));

  res.json({
    success: true,
    result: {
      initialValue: iv,
      finalValue: fv,
      years: Math.round(n * 100) / 100,
      cagr: Math.round(cagr * 100) / 100,
      absoluteReturn: Math.round(absoluteReturn * 100) / 100,
      gain: Math.round(fv - iv),
      projections,
    }
  });
});

router.post('/tax-slab-analyzer', (req, res) => {
  let { income, regime = 'new', age_group = 'below_60' } = req.body;
  if (!income) return res.status(400).json({ success: false, error: 'Income required' });

  if (age_group === 'regular') age_group = 'below_60';
  else if (age_group === 'senior') age_group = 'above_60';
  else if (age_group === 'super_senior') age_group = 'above_80';

  const inc = parseFloat(income);
  let tax = 0;
  let slabs = [];

  if (regime === 'new') {
    const brackets = [
      { upto: 300000, rate: 0 },
      { upto: 600000, rate: 5 },
      { upto: 900000, rate: 10 },
      { upto: 1200000, rate: 15 },
      { upto: 1500000, rate: 20 },
      { upto: Infinity, rate: 30 },
    ];
    let prev = 0;
    for (const slab of brackets) {
      if (inc <= prev) break;
      const taxable = Math.min(inc, slab.upto) - prev;
      const slabTax = taxable * (slab.rate / 100);
      tax += slabTax;
      slabs.push({ from: prev, to: slab.upto === Infinity ? inc : slab.upto, rate: slab.rate, taxableAmount: Math.round(taxable), tax: Math.round(slabTax) });
      prev = slab.upto;
    }
  } else {
    const basicExemption = age_group === 'above_80' ? 500000 : age_group === 'above_60' ? 300000 : 250000;
    const brackets = [
      { upto: basicExemption, rate: 0 },
      { upto: 500000, rate: 5 },
      { upto: 1000000, rate: 20 },
      { upto: Infinity, rate: 30 },
    ];
    let prev = 0;
    for (const slab of brackets) {
      if (inc <= prev || slab.upto <= prev) continue;
      const from = Math.max(prev, 0);
      const to = slab.upto === Infinity ? inc : slab.upto;
      if (inc <= from) break;
      const taxable = Math.min(inc, to) - from;
      const slabTax = taxable * (slab.rate / 100);
      tax += slabTax;
      slabs.push({ from, to, rate: slab.rate, taxableAmount: Math.round(taxable), tax: Math.round(slabTax) });
      prev = slab.upto;
    }
  }

  const cess = tax * 0.04;
  const totalTax = tax + cess;
  const effectiveRate = inc > 0 ? (totalTax / inc) * 100 : 0;

  res.json({
    success: true,
    income: inc,
    age_group,
    slab_details: slabs.map((slab) => ({
      range: slab.to === Infinity ? `${slab.from}+` : `${slab.from} - ${slab.to}`,
      rate: `${slab.rate}%`,
      taxable_amount: slab.taxableAmount,
      tax: slab.tax,
    })),
    tax_before_cess: Math.round(tax),
    cess_amount: Math.round(cess),
    total_tax: Math.round(totalTax),
    effective_rate: Math.round(effectiveRate * 100) / 100,
    taxBreakdown: slabs,
    incomeTax: Math.round(tax),
    educationCess: Math.round(cess),
    totalTax: Math.round(totalTax),
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    netIncome: Math.round(inc - totalTax),
    regime,
    slabs,
  });
});

router.post('/invoice-generator', (req, res) => {
  const data = req.body;

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);
  };

  const items = (data.items || []).map(item => {
    const qty = parseFloat(item.quantity ?? item.qty) || 0;
    const price = parseFloat(item.unit_price ?? item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const tax = parseFloat(item.tax ?? item.tax_rate ?? data.tax_rate) || 0;
    const lineSubtotal = qty * price;
    const discountedSubtotal = lineSubtotal * (1 - discount / 100);
    const taxAmount = discountedSubtotal * (tax / 100);
    const total = discountedSubtotal + taxAmount;
    return { ...item, qty, price, discount, tax, subtotal: discountedSubtotal, lineSubtotal, taxAmount, total };
  });

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const taxTotal = items.reduce((s, i) => s + i.taxAmount, 0);
  const discount = parseFloat(data.discount) || 0;
  const grandTotal = subtotal + taxTotal - discount;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invoice ${data.invoice_number || '#001'}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; background: #fff; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #3b82f6; padding-bottom: 24px; }
  .company-name { font-size: 28px; font-weight: 700; color: #1e40af; }
  .invoice-title { font-size: 36px; font-weight: 800; color: #1e40af; text-align: right; }
  .invoice-meta { text-align: right; margin-top: 8px; font-size: 14px; color: #555; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; }
  .party-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 6px; }
  .party-name { font-size: 16px; font-weight: 600; color: #111; margin-bottom: 4px; }
  .party-detail { font-size: 13px; color: #555; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
  thead { background: #1e40af; color: #fff; }
  thead th { padding: 12px 14px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  tbody tr:nth-child(even) { background: #f8faff; }
  tbody td { padding: 11px 14px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  .totals { display: flex; justify-content: flex-end; }
  .totals-table { width: 300px; }
  .totals-table tr td { padding: 6px 12px; font-size: 14px; }
  .totals-table .grand-total { font-size: 16px; font-weight: 700; color: #1e40af; border-top: 2px solid #1e40af; }
  .notes { margin-top: 32px; padding: 16px; background: #f8faff; border-left: 4px solid #3b82f6; border-radius: 4px; }
  .notes-label { font-weight: 600; font-size: 12px; text-transform: uppercase; color: #3b82f6; margin-bottom: 6px; }
  .notes-text { font-size: 13px; color: #555; line-height: 1.6; }
  .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  @media print { body { padding: 20px; } .print-btn { display: none; } }
  .print-btn { position: fixed; bottom: 20px; right: 20px; background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; box-shadow: 0 4px 14px rgba(59,130,246,0.4); }
  .print-btn:hover { background: #1d4ed8; }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">🖨 Print to PDF</button>

<div class="header">
  <div>
    <div class="company-name">${data.company_name || 'Your Company'}</div>
    <div style="font-size:13px;color:#555;margin-top:4px;line-height:1.6">${(data.company_address || '').replace(/\n/g,'<br>')}</div>
    ${data.company_gstin ? `<div style="font-size:12px;color:#888;margin-top:4px">GSTIN: ${data.company_gstin}</div>` : ''}
  </div>
  <div>
    <div class="invoice-title">INVOICE</div>
    <div class="invoice-meta">
      <div><strong>Invoice #:</strong> ${data.invoice_number || '001'}</div>
      <div><strong>Date:</strong> ${data.invoice_date || data.date || new Date().toLocaleDateString()}</div>
      ${data.due_date ? `<div><strong>Due Date:</strong> ${data.due_date}</div>` : ''}
    </div>
  </div>
</div>

<div class="parties">
  <div>
    <div class="party-label">Bill To</div>
    <div class="party-name">${data.client_name || 'Client Name'}</div>
    <div class="party-detail">${(data.client_address || '').replace(/\n/g,'<br>')}${data.client_gstin ? `<br>GSTIN: ${data.client_gstin}` : ''}</div>
  </div>
  <div>
    ${data.project_name ? `<div class="party-label">Project</div><div class="party-name">${data.project_name}</div>` : ''}
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Description</th>
      <th>Qty</th>
      <th>Unit Price</th>
      <th>Tax %</th>
      <th>Amount</th>
    </tr>
  </thead>
  <tbody>
    ${items.map((item, i) => `<tr>
      <td>${i + 1}</td>
      <td><strong>${item.name || item.description || ''}</strong>${item.description && item.name ? `<br><span style="font-size:12px;color:#777">${item.description}</span>` : ''}${item.discount ? `<br><span style="font-size:12px;color:#777">Discount: ${item.discount}%</span>` : ''}</td>
      <td>${item.qty}</td>
      <td>${formatCurrency(item.price, data.currency)}</td>
      <td>${item.tax}%</td>
      <td>${formatCurrency(item.total, data.currency)}</td>
    </tr>`).join('')}
  </tbody>
</table>

<div class="totals">
  <table class="totals-table">
    <tr><td>Subtotal</td><td style="text-align:right">${formatCurrency(subtotal, data.currency)}</td></tr>
    <tr><td>Tax</td><td style="text-align:right">${formatCurrency(taxTotal, data.currency)}</td></tr>
    ${discount ? `<tr><td>Discount</td><td style="text-align:right">-${formatCurrency(discount, data.currency)}</td></tr>` : ''}
    <tr class="grand-total"><td><strong>Total</strong></td><td style="text-align:right"><strong>${formatCurrency(grandTotal, data.currency)}</strong></td></tr>
  </table>
</div>

${data.notes ? `<div class="notes"><div class="notes-label">Notes</div><div class="notes-text">${data.notes}</div></div>` : ''}
${data.bank_details ? `<div class="notes" style="margin-top:16px"><div class="notes-label">Payment Details</div><div class="notes-text">${data.bank_details.replace(/\n/g,'<br>')}</div></div>` : ''}

<div class="footer">Thank you for your business! • Generated by DailyTools247</div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

router.post('/sip-calculator', (req, res) => {
  const { monthlyInvestment, annualRate, years } = req.body;
  if (!monthlyInvestment || !annualRate || !years) {
    return res.status(400).json({ success: false, error: 'Monthly investment, annual rate, and years required' });
  }

  const P = parseFloat(monthlyInvestment);
  const r = parseFloat(annualRate) / 100 / 12; // Monthly rate
  const n = parseInt(years) * 12; // Total months

  // SIP calculation: A = P × [{(1 + r)^n – 1} / r] × (1 + r)
  const amount = r === 0 ? P * n : P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const totalInvested = P * n;
  const wealthGain = amount - totalInvested;

  // Generate yearly breakdown
  const yearlyBreakdown = [];
  for (let year = 1; year <= parseInt(years); year++) {
    const months = year * 12;
    const yearAmount = r === 0 ? P * months : P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const yearInvested = P * months;
    const yearGain = yearAmount - yearInvested;
    
    yearlyBreakdown.push({
      year,
      invested: Math.round(yearInvested),
      amount: Math.round(yearAmount),
      gain: Math.round(yearGain)
    });
  }

  res.json({
    success: true,
    result: {
      monthlyInvestment: P,
      annualRate: parseFloat(annualRate),
      years: parseInt(years),
      totalInvested: Math.round(totalInvested),
      amount: Math.round(amount),
      wealthGain: Math.round(wealthGain),
      yearlyBreakdown
    }
  });
});

router.post('/roi-calculator', (req, res) => {
  const { initialInvestment, finalValue, years, months = 0 } = req.body;
  if (!initialInvestment || !finalValue || (!years && !months)) {
    return res.status(400).json({ success: false, error: 'Initial investment, final value, and time period required' });
  }

  const initial = parseFloat(initialInvestment);
  const final = parseFloat(finalValue);
  const yearsVal = parseFloat(years) || 0;
  const monthsVal = parseFloat(months) || 0;
  
  // Convert to years
  const totalYears = yearsVal + (monthsVal / 12);
  
  if (totalYears === 0) {
    return res.status(400).json({ success: false, error: 'Time period cannot be zero' });
  }

  // ROI calculation: ROI = [(Final Value - Initial Investment) / Initial Investment] × 100
  const absoluteGain = final - initial;
  const roiPercentage = (absoluteGain / initial) * 100;
  
  // Annualized ROI: CAGR = (Final Value / Initial Investment)^(1/years) - 1
  const cagr = Math.pow(final / initial, 1 / totalYears) - 1;
  const annualizedRoi = cagr * 100;

  res.json({
    success: true,
    result: {
      initialInvestment: initial,
      finalValue: final,
      years: yearsVal,
      months: monthsVal,
      totalYears: Math.round(totalYears * 100) / 100,
      absoluteGain: Math.round(absoluteGain * 100) / 100,
      roiPercentage: Math.round(roiPercentage * 100) / 100,
      annualizedRoi: Math.round(annualizedRoi * 100) / 100,
      cagr: Math.round(cagr * 10000) / 10000
    }
  });
});

// Add OPTIONS handler for all endpoints in this router
router.options('*', (req, res) => {
  res.sendStatus(204);
});
module.exports = router;
