import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CashflowSection from '../CashflowSection';

function Wrapper() {
  const [incomeSources, setIncomeSources] = useState([]);
  return (
    <CashflowSection
      incomeSources={incomeSources}
      expenses={[]}
      onIncomeChange={setIncomeSources}
      onExpenseChange={() => {}}
    />
  );
}

test('handleAddIncome adds an entry when category and amount are provided and updates totals', () => {
  render(<Wrapper />);

  const categorySelect = screen.getByRole('combobox', { name: /select income type/i });
  fireEvent.change(categorySelect, { target: { value: 'primary' } });

  const amountInput = screen.getByPlaceholderText('Amount');
  fireEvent.change(amountInput, { target: { value: '1000' } });

  const addButton = screen.getByRole('button');
  fireEvent.click(addButton);

  expect(screen.getByText('Primary Income')).toBeInTheDocument();
  expect(screen.getAllByText('$1,000').length).toBeGreaterThanOrEqual(1);
});
