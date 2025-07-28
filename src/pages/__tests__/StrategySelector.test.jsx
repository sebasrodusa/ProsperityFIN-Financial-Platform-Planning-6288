import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

const strategiesData = [
  { id: '1', name: 'Strategy A', description: 'Desc A', category: 'retirement', strategy_products_pf: [] },
  { id: '2', name: 'Strategy B', description: 'Desc B', category: 'wealth_building', strategy_products_pf: [] }
];

vi.mock('../../lib/supabaseClient', () => ({
  useSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: strategiesData, error: null })
      })
    })
  })
}));

vi.mock('../../components/ui/LoadingSpinner', () => ({
  default: () => <div data-testid="spinner" />
}));

import StrategySelector from '../../components/proposals/StrategySelector';

function Wrapper({ onStrategyChange }) {
  const [selectedStrategy, setSelectedStrategy] = React.useState(null);
  const handleChange = (id) => {
    setSelectedStrategy(id);
    onStrategyChange(id);
  };
  return (
    <StrategySelector
      selectedStrategy={selectedStrategy}
      onStrategyChange={handleChange}
      selectedProduct={null}
      onProductChange={() => {}}
    />
  );
}

test('clicking a strategy calls handler once and highlights card', async () => {
  const handler = vi.fn();
  render(<Wrapper onStrategyChange={handler} />);

  await waitFor(() => screen.getByText('Strategy A'));
  const card = screen.getByText('Strategy A').closest('button');
  expect(card.className).not.toContain('border-primary-500');

  fireEvent.click(card);
  await waitFor(() => expect(handler).toHaveBeenCalledTimes(1));

  const selectedCard = screen.getByText('Strategy A').closest('button');
  expect(selectedCard.className).toContain('border-primary-500');
});
