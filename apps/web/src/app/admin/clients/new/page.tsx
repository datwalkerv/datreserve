'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); setError(''); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('clients', { json: form });
      router.push('/admin/clients');
    } catch (err: any) {
      let msg = 'Something went wrong.';
      if (err?.response) {
        try { const b = await err.response.json(); msg = b?.message ?? msg; } catch {}
      }
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <Link href="/admin/clients" className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={16} /> Back to clients
      </Link>
      <h1 className="mb-8 font-serif text-2xl text-text-primary">Add client</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Full name</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. John Doe"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Phone number</label>
          <input type="tel" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} placeholder="+36 20 000 0000"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-60">
          {loading ? 'Adding…' : 'Add client'}
        </button>
      </form>
    </div>
  );
}
