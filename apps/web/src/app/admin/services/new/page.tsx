'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { DurationUnit } from '@datreserve/shared-types';

export default function NewServicePage() {
  const router = useRouter();
  const [currency, setCurrency] = useState('');
  const [form, setForm] = useState({
    name: '', price: '', durationValue: '60',
    durationUnit: DurationUnit.MINUTES as string, description: '', notes: '', locationText: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const COUNTRY_CURRENCY: Record<string, string> = {
    US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', HU: 'HUF', RO: 'RON',
    PL: 'PLN', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR',
    CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', FI: 'EUR', PT: 'EUR',
    GR: 'EUR', CZ: 'CZK', SK: 'EUR', HR: 'EUR', RS: 'RSD', UA: 'UAH',
    TR: 'TRY', CA: 'CAD', AU: 'AUD', NZ: 'NZD', AE: 'AED', SG: 'SGD',
  };

  useEffect(() => {
    api.get('me').json<{ currency?: string; country?: string }>()
      .then(data => {
        const c = data?.currency || (data?.country ? COUNTRY_CURRENCY[data.country] : '');
        if (c) setCurrency(c);
      })
      .catch(() => {});
  }, []);

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Service name is required.'); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { setError('Enter a valid price.'); return; }
    const durationValue = parseInt(form.durationValue);
    if (isNaN(durationValue) || durationValue < 1) { setError('Enter a valid duration.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('services', { json: { ...form, currency, price, durationValue } });
      router.push('/admin/services');
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
      <Link href="/admin/services" className="mb-6 flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft size={16} /> Back to services
      </Link>
      <h1 className="mb-8 font-serif text-2xl text-text-primary">New service</h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
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
        <button type="submit" disabled={loading}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-60">
          {loading ? 'Creating…' : 'Create service'}
        </button>
      </form>
    </div>
  );
}
