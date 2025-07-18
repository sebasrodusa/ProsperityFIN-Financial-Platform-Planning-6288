import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import CrmProvider, { useCrm } from '../CrmContext';
import { AuthContext } from '../AuthContext';
import supabase from '../../lib/supabase';
import { vi } from 'vitest';

vi.mock('../../lib/supabase', () => ({ default: { from: vi.fn() } }));

const user = { id: 'advisor1' };

function setupSupabase(note, updated) {
  supabase.from.mockImplementation((table) => {
    return {
      select: vi.fn().mockResolvedValue({ data: [] }),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn(() => ({
        select: () => ({ single: () => Promise.resolve({ data: note }) })
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockReturnThis(),
        select: () => ({ single: () => Promise.resolve({ data: updated }) })
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      upsert: vi.fn(() => ({
        select: () => ({ single: () => Promise.resolve({ data: null }) })
      }))
    };
  });
}

test('add, update and delete notes', async () => {
  const note = { id: 'n1', client_id: 'c1', content: 'a', created_at: '2023', updated_at: '2023' };
  const updated = { ...note, content: 'b', updated_at: '2024' };
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

  await crm.addClientNote('c1', 'a');
  expect(crm.getClientNotes('c1')[0].content).toBe('a');

  await crm.updateClientNote('c1', 'n1', 'b');
  expect(crm.getClientNotes('c1')[0].content).toBe('b');

  await crm.deleteClientNote('c1', 'n1');
  expect(crm.getClientNotes('c1').length).toBe(0);
});
