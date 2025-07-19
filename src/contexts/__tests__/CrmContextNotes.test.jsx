import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CrmProvider, { useCrm } from '../CrmContext';
import supabase from '../../lib/supabase';

// Mock AuthContext with a simple provider
const AuthContext = React.createContext();
vi.mock('../AuthContext', () => ({
  useAuthContext: () => React.useContext(AuthContext)
}));
import { vi } from 'vitest';

vi.mock('../../lib/supabase', () => ({ default: { from: vi.fn() } }));

const user = { id: 'advisor1' };

function setupSupabase(note, updated) {
  supabase.from.mockImplementation(() => ({
    select: () => ({
      eq: () => Promise.resolve({ data: [] })
    }),
    insert: () => ({
      select: () => ({ single: () => Promise.resolve({ data: note }) })
    }),
    update: () => ({
      eq: () => ({
        eq: () => ({
          select: () => ({ single: () => Promise.resolve({ data: updated }) })
        })
      })
    }),
    delete: () => ({
      eq: () => ({
        eq: () => Promise.resolve({ error: null })
      })
    }),
    upsert: () => ({
      select: () => ({ single: () => Promise.resolve({ data: null }) })
    })
  }));
}

test('add, update and delete notes', async () => {
  const note = { id: 'n1', client_id: 'c1', note: 'a', created_at: '2023', updated_at: '2023' };
  const updated = { ...note, note: 'b', updated_at: '2024' };
  setupSupabase(note, updated);

  let crm;
  function Consumer() {
    crm = useCrm();
    return null;
  }

  render(
    <AuthContext.Provider value={{ user }}>
      <CrmProvider>
        <Consumer />
      </CrmProvider>
    </AuthContext.Provider>
  );

  let result;
  await act(async () => {
    result = await crm.addClientNote('c1', 'a');
  });
  expect(result.note.note).toBe('a');

  await act(async () => {
    result = await crm.updateClientNote('c1', 'n1', 'b');
  });
  expect(result.success).toBe(true);

  await act(async () => {
    result = await crm.deleteClientNote('c1', 'n1');
  });
  expect(result.success).toBe(true);
});
