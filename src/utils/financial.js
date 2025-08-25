export function annualizeIncome(amount, frequency = 'monthly') {
  const amt = parseFloat(amount) || 0;
  const freq = (frequency || 'monthly').toLowerCase();
  switch (freq) {
    case 'weekly':
      return amt * 52;
    case 'annual':
    case 'yearly':
      return amt;
    case 'monthly':
    default:
      return amt * 12;
  }
}

export function calculateTotalAnnualIncome(incomeSources = []) {
  return incomeSources.reduce(
    (sum, source) => sum + annualizeIncome(source.amount, source.frequency),
    0
  );
}

export function annualizeExpense(amount, frequency = 'monthly') {
  const amt = parseFloat(amount) || 0;
  const freq = (frequency || 'monthly').toLowerCase();
  switch (freq) {
    case 'weekly':
      return amt * 52;
    case 'annual':
    case 'yearly':
      return amt;
    case 'monthly':
    default:
      return amt * 12;
  }
}

export function calculateTotalAnnualExpenses(expenses = []) {
  return expenses.reduce(
    (sum, exp) => sum + annualizeExpense(exp.amount, exp.frequency),
    0
  );
}

export function calculateFinancialIndependenceNumber(incomeSources = []) {
  // FIN is defined as 20× total annual income (inverse of the 4% rule)
  const totalIncome = calculateTotalAnnualIncome(incomeSources);
  return totalIncome * 20;
}
