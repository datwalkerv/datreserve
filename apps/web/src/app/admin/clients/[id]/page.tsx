'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`clients/${params.id}`).json<any>()
      .then(data => setForm({
        name: data.name ?? '',
        email: data.email ?? '',
        phoneNumber: data.phoneNumber ?? '',
        notes: data.notes ?? '',
      }))
      .catch(() => setError('Failed to load client.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); setError(''); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.patch(`clients/${params.id}`, { json: form });
      router.push('/admin/clients');
    } catch (err: any) {
      let msg = 'Failed to save.';
      if (err?.response) {
        try { const b = await err.response.json(); msg = b?.message ?? msg; } catch {}
      }
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await api.delete(`clients/${params.id}`);
      router.push('/admin/clients');
    } catch {
      setError('Failed to delete.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) {
    return <div className="p-8"><div className="h-6 w-40 animate-pulse rounded bg-surface-2" /></div>;
  }

  return (
    <div className="p-8">
      <Link href="/admin/clients" className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={16} /> Back to clients
      </Link>
      <h1 className="mb-8 font-serif text-2xl text-text-primary">Edit client</h1>

      <form onSubmit={handleSave} className="max-w-lg space-y-5">
        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Full name</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Phone number</label>
          <input type="tel" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-60">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Are you sure?</span>
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="rounded-lg bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/30 disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-border px-4 py-2.5 text-sm text-text-secondary hover:bg-surface">
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleDelete}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
