import { supabase } from '../lib/supabaseClient';

const baseUrl = import.meta.env.VITE_SUPABASE_URL
  .replace('.supabase.co', '.functions.supabase.co') + '/publitio-proxy';

export async function uploadFile(file, folder = '') {
  if (!file) throw new Error('File is required');
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    const ext = file.name.split('.').pop();
    const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    formData.append('public_id', name);
  }

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Upload failed');
  }
  return data; // { public_id, url }
}

export async function deleteFile(publicId) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');
  const url = `${baseUrl}?public_id=${encodeURIComponent(publicId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Delete failed');
  }
  return true;
}
