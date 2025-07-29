import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

const strategiesData = [
  { id: '1', name: 'Strategy A', description: 'Desc A', category: 'retirement', is_featured: true, strategy_products_pf: [] },
  { id: '2', name: 'Strategy B', description: 'Desc B', category: 'wealth_building', is_featured: false, strategy_products_pf: [] }
];

vi.mock('../../lib/supabaseClient', () => ({
  useSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          order: () => Promise.resolve({ data: strategiesData, error: null })
        })
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

test('filters strategies by selected category', async () => {
  render(<Wrapper onStrategyChange={() => {}} />);

  await waitFor(() => screen.getByText('Strategy A'));

  expect(screen.getByText('Strategy A')).toBeInTheDocument();
  expect(screen.getByText('Strategy B')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/Filter by Category/i), {
    target: { value: 'retirement' }
  });

  expect(screen.getByText('Strategy A')).toBeInTheDocument();
  expect(screen.queryByText('Strategy B')).toBeNull();
});

test('only the clicked card has selected styling', async () => {
  render(<Wrapper onStrategyChange={() => {}} />);

  await waitFor(() => screen.getByText('Strategy A'));

  const cardA = screen.getByText('Strategy A').closest('button');
  const cardB = screen.getByText('Strategy B').closest('button');

  fireEvent.click(cardA);
  await waitFor(() => expect(cardA.className).toContain('border-primary-500'));
  expect(cardB.className).not.toContain('border-primary-500');

  fireEvent.click(cardB);
  await waitFor(() => expect(cardB.className).toContain('border-primary-500'));
  expect(cardA.className).not.toContain('border-primary-500');
});
