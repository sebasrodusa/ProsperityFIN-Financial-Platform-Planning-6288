import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Navbar to avoid AuthProvider dependency
vi.mock('../../components/layout/Navbar', () => ({
  default: () => <div />
}));

vi.mock('../../contexts/DataContext', () => ({
  useData: () => ({
    clients: [{ id: 'c1', name: 'Client One', avatar: '', email: 'c@example.com', phone: '123', createdAt: new Date().toISOString() }]
  })
}));

vi.mock('../../contexts/CrmContext', () => ({
  useCrm: () => ({
    getClientStatus: () => ({ status: 'initial_meeting' }),
    getClientHistory: () => [],
    getClientTasks: () => [],
    getClientNotes: () => [{ id: 'n1', note: 'note', createdAt: '', updatedAt: '' }],
    updateClientStatus: vi.fn(),
    addClientTask: vi.fn(),
    updateClientTask: vi.fn(),
    deleteClientTask: vi.fn(),
    addClientNote: vi.fn(),
    updateClientNote: vi.fn(),
    deleteClientNote: vi.fn()
  })
}));

import ClientCRM from '../ClientCRM';

 test('renders Notes tab and content', () => {
  render(
    <MemoryRouter initialEntries={['/crm/c1']}>
      <Routes>
        <Route path="/crm/:clientId" element={<ClientCRM />} />
      </Routes>
    </MemoryRouter>
  );

  const notesTab = screen.getByText('Notes');
  expect(notesTab).toBeInTheDocument();
  fireEvent.click(notesTab);
  expect(screen.getByText('Client Notes')).toBeInTheDocument();
});
