import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock supabase client
vi.mock('../../lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn()
      }
    }
  };
});

let uploadFile;
let deleteFile;
let supabase;

beforeEach(async () => {
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
  // re-import module to use fresh env
  vi.resetModules();
  const mod = await import('../publitio');
  uploadFile = mod.uploadFile;
  deleteFile = mod.deleteFile;
  supabase = (await import('../../lib/supabaseClient')).supabase;
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('uploadFile', () => {
  it('uploads successfully', async () => {
    const file = new File(['data'], 'test.txt', { type: 'text/plain' });
    supabase.auth.getSession.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ public_id: 'id1', url: 'url' })
    });

    const data = await uploadFile(file, 'docs');

    expect(fetch).toHaveBeenCalled();
    expect(data).toEqual({ public_id: 'id1', url: 'url' });
  });

  it('throws on failure', async () => {
    const file = new File(['data'], 'test.txt', { type: 'text/plain' });
    supabase.auth.getSession.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
    fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'fail' })
    });

    await expect(uploadFile(file)).rejects.toThrow('fail');
  });
});

describe('deleteFile', () => {
  it('deletes successfully', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
    fetch.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ success: true }) });

    const result = await deleteFile('file123');

    const baseUrl = 'https://test.functions.supabase.co/publitio-proxy?public_id=file123';
    expect(fetch).toHaveBeenCalledWith(baseUrl, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer tok' }
    });
    expect(result).toBe(true);
  });

  it('throws on failure', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { access_token: 'tok' } } });
    fetch.mockResolvedValue({ ok: false, json: vi.fn().mockResolvedValue({ error: 'bad' }) });

    await expect(deleteFile('file123')).rejects.toThrow('bad');
  });
});

describe('environment validation', () => {
  it('throws a controlled error when VITE_SUPABASE_URL is missing', async () => {
    delete process.env.VITE_SUPABASE_URL;
    vi.resetModules();
    const { uploadFile } = await import('../publitio');
    await expect(uploadFile(new File(['data'], 'test.txt'))).rejects.toThrow(
      'VITE_SUPABASE_URL is not defined'
    );
  });
});
