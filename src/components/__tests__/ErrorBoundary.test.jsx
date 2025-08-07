import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import ErrorBoundary from '../ErrorBoundary';

function ProblemChild() {
  React.useEffect(() => {
    throw new Error('error');
  }, []);
  return <div>Loading...</div>;
}

describe('ErrorBoundary', () => {
  it('renders fallback UI when a child throws', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    await waitFor(() => expect(screen.getByText('Something went wrong.')).toBeInTheDocument());
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    spy.mockRestore();
  });
});
