'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { DurationUnit } from '@datreserve/shared-types';

const COUNTRY_CURRENCY: Record<string, string> = {
  US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', HU: 'HUF', RO: 'RON',
  PL: 'PLN', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
  CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', FI: 'EUR', PT: 'EUR',
  GR: 'EUR', CZ: 'CZK', SK: 'EUR', HR: 'EUR', RS: 'RSD', UA: 'UAH',
  TR: 'TRY', CA: 'CAD', AU: 'AUD', NZ: 'NZD', AE: 'AED', SG: 'SGD',
};

export default function EditServicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [currency, setCurrency] = useState('');
  const [form, setForm] = useState({
    name: '', price: '', durationValue: '60',
    durationUnit: DurationUnit.MINUTES as string, description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`services/${params.id}`).json<any>(),
      api.get('me').json<{ currency?: string; country?: string }>(),
    ]).then(([svc, profile]) => {
      setForm({
        name: svc.name ?? '',
        price: String(svc.price ?? ''),
        durationValue: String(svc.durationValue ?? 60),
        durationUnit: svc.durationUnit ?? DurationUnit.MINUTES,
        description: svc.description ?? '',
      });
      const c = svc.currency || profile?.currency || (profile?.country ? COUNTRY_CURRENCY[profile.country] : '');
      if (c) setCurrency(c);
    }).catch(() => setError('Failed to load service.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
    setError('');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Service name is required.'); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { setError('Enter a valid price.'); return; }
    const durationValue = parseInt(form.durationValue);
    if (isNaN(durationValue) || durationValue < 1) { setError('Enter a valid duration.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.patch(`services/${params.id}`, { json: { ...form, currency, price, durationValue } });
      router.push('/admin/services');
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
      await api.delete(`services/${params.id}`);
      router.push('/admin/services');
    } catch {
      setError('Failed to delete.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-6 w-40 animate-pulse rounded bg-surface-2" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link href="/admin/services" className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={16} /> Back to services
      </Link>
      <h1 className="mb-8 font-serif text-2xl text-text-primary">Edit service</h1>

      <form onSubmit={handleSave} className="max-w-lg space-y-5">
        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Service name</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Haircut"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Price</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Currency</label>
            <div className="flex h-[46px] items-center rounded-lg border border-border bg-surface px-4 text-sm text-text-primary">
              {currency || <span className="text-text-muted">—</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Duration</label>
            <input type="number" min="1" value={form.durationValue} onChange={e => set('durationValue', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Unit</label>
            <select value={form.durationUnit} onChange={e => set('durationUnit', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent">
              <option value={DurationUnit.MINUTES}>Minutes</option>
              <option value={DurationUnit.HOURS}>Hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
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
