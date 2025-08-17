import { test, expect } from 'vitest';
import {
  calculateFinancialIndependenceNumber,
  calculateTotalAnnualIncome,
} from '../../utils/financial';

test('monthly income of $5,000 results in FIN of $1,200,000', () => {
  const sources = [{ amount: '5000', frequency: 'monthly' }];
  const annual = calculateTotalAnnualIncome(sources);
  expect(calculateFinancialIndependenceNumber(sources)).toBe(annual * 20);
  expect(calculateFinancialIndependenceNumber(sources)).toBe(1200000);
});

test('mixed income sources produce FIN equal to 20× annual income', () => {
  const sources = [
    { amount: '5000', frequency: 'monthly' },
    { amount: '600', frequency: 'weekly' },
    { amount: '10000', frequency: 'annual' },
  ];
  const annual = calculateTotalAnnualIncome(sources);
  expect(annual).toBe(101200);
  expect(calculateFinancialIndependenceNumber(sources)).toBe(annual * 20);
});
