import { describe, it, expect, vi } from 'vitest';

const createClient = vi.fn();
vi.mock('@supabase/supabase-js', () => ({ createClient }));

describe('supabaseClient', () => {
  it('returns stub when env vars are missing', async () => {
    const originalUrl = process.env.VITE_SUPABASE_URL;
    const originalKey = process.env.VITE_SUPABASE_ANON_KEY;
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.VITE_SUPABASE_ANON_KEY;
    vi.resetModules();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { supabase } = await import('../supabaseClient');
    expect(errorSpy).toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
    expect(typeof supabase).toBe('function');
    await expect(supabase.auth.getSession()).resolves.toEqual({});
    errorSpy.mockRestore();
    process.env.VITE_SUPABASE_URL = originalUrl;
    process.env.VITE_SUPABASE_ANON_KEY = originalKey;
  });
});
