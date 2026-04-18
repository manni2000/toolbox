/**
 * Test script for Indian number formatting utilities
 * Run this to verify the formatting functions work correctly
 */

import {
  formatIndianCurrency,
  formatIndianNumber,
  formatIndianCurrencyWithCommas,
  formatSmartIndianCurrency,
  formatAmount
} from './number-formatting';
import { describe, expect, it } from "vitest";

// console.log('=== Indian Number Formatting Tests ===\n');

// Test cases with expected outputs
const testCases = [
  { value: 500, desc: 'Small amount (500)' },
  { value: 5000, desc: 'Thousands (5,000)' },
  { value: 50000, desc: 'Fifty thousand' },
  { value: 100000, desc: 'One Lakh' },
  { value: 500000, desc: 'Five Lakhs' },
  { value: 1000000, desc: 'Ten Lakhs' },
  { value: 10000000, desc: 'One Crore' },
  { value: 50000000, desc: 'Five Crores' },
  { value: 5372829203, desc: 'Large number (537.28 Crore)' },
  { value: -100000, desc: 'Negative number (-1 Lakh)' },
  { value: 0, desc: 'Zero' },
];

// console.log('1. formatIndianCurrency() - Main formatter');
// console.log('─'.repeat(60));
testCases.forEach(({ value, desc }) => {
  const result = formatIndianCurrency(value);
  // console.log(`${desc.padEnd(35)} → ${result}`);
});

// console.log('\n2. formatIndianCurrency() with compact mode');
// console.log('─'.repeat(60));
testCases.slice(5, 9).forEach(({ value, desc }) => {
  const result = formatIndianCurrency(value, { compact: true, decimals: 1 });
  // console.log(`${desc.padEnd(35)} → ${result}`);
});

// console.log('\n3. formatIndianCurrency() with 0 decimals');
// console.log('─'.repeat(60));
testCases.slice(2, 6).forEach(({ value, desc }) => {
  const result = formatIndianCurrency(value, { decimals: 0 });
  // console.log(`${desc.padEnd(35)} → ${result}`);
});

// console.log('\n4. formatIndianNumber() - Without currency symbol');
// console.log('─'.repeat(60));
testCases.slice(3, 8).forEach(({ value, desc }) => {
  const result = formatIndianNumber(value);
  // console.log(`${desc.padEnd(35)} → ${result}`);
});

// console.log('\n5. formatIndianCurrencyWithCommas() - Traditional format');
// console.log('─'.repeat(60));
[100000, 1000000, 5372829203].forEach(value => {
  const result = formatIndianCurrencyWithCommas(value);
  // console.log(`${value.toString().padEnd(35)} → ${result}`);
});

// console.log('\n6. formatSmartIndianCurrency() - Auto-switching');
// console.log('─'.repeat(60));
[5000, 50000, 100000, 500000, 10000000].forEach(value => {
  const result = formatSmartIndianCurrency(value);
  // console.log(`${value.toString().padEnd(35)} → ${result}`);
});

// console.log('\n7. formatAmount() - Multi-currency support');
// console.log('─'.repeat(60));
const amount = 5372829203;
// console.log(`INR (Indian format):        ${formatAmount(amount, { currency: 'INR', format: 'indian' })}`);
// console.log(`USD (International):        ${formatAmount(amount, { currency: 'USD', format: 'international' })}`);
// console.log(`USD (Compact):              ${formatAmount(amount, { currency: 'USD', format: 'compact' })}`);
// console.log(`EUR (International):        ${formatAmount(amount, { currency: 'EUR', format: 'international' })}`);

// console.log('\n8. Edge cases');
// console.log('─'.repeat(60));
// console.log(`NaN:                        ${formatIndianCurrency(NaN)}`);
// console.log(`null (as 0):                ${formatIndianCurrency(null as any)}`);
// console.log(`undefined (as 0):           ${formatIndianCurrency(undefined as any)}`);
// console.log(`Very small (0.5):           ${formatIndianCurrency(0.5)}`);
// console.log(`Large negative:             ${formatIndianCurrency(-5372829203)}`);

// console.log('\n✅ All tests completed!\n');
// console.log('Usage examples for components:');
// console.log('─'.repeat(60));
// console.log(`
import { formatIndianCurrency } from '@/lib/number-formatting';

// In your component:
<p>{formatIndianCurrency(result.futureValue)}</p>
<p>{formatIndianCurrency(result.totalInvestment)}</p>
<p>{formatIndianCurrency(result.returns)}</p>

// With options:
<p>{formatIndianCurrency(value, { decimals: 0 })}</p>
<p>{formatIndianCurrency(value, { compact: true })}</p>
`);

describe("number formatting", () => {
  it("formats INR values using Indian digit grouping", () => {
    expect(formatIndianCurrency(100000)).toBe("₹1,00,000.00");
    expect(formatIndianNumber(100000)).toBe("1,00,000.00");
    expect(formatIndianCurrencyWithCommas(1000000)).toBe("₹10,00,000.00");
  });

  it("supports compact and international variants", () => {
    expect(formatIndianCurrency(10000000, { compact: true, decimals: 1 })).toBe("₹1.0Cr");
    expect(formatSmartIndianCurrency(50000)).toBe("₹50,000.00");
    expect(formatSmartIndianCurrency(100000)).toBe("₹1.00L");
    expect(formatAmount(5372829203, { currency: "USD", format: "international" })).toBe("$5,372,829,203.00");
  });

  it("sanitizes invalid values", () => {
    expect(formatIndianCurrency(Number.NaN)).toBe("₹0.00");
    expect(formatIndianCurrency(undefined as unknown as number)).toBe("₹0.00");
  });
});
