import { test, expect } from 'vitest';

function calculateFIN(incomeSources) {
  const totalIncome = incomeSources.reduce((sum, source) => {
    const amount = parseFloat(source.amount || 0);
    const annualAmount = {
      monthly: amount * 12,
      weekly: amount * 52,
      annual: amount
    }[source.frequency || 'monthly'];
    return sum + annualAmount;
  }, 0);
  return totalIncome * 20;
}

test('monthly income of $5,000 results in FIN of $1,200,000', () => {
  const fin = calculateFIN([{ amount: '5000', frequency: 'monthly' }]);
  expect(fin).toBe(1200000);
});
