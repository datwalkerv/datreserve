'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Niche } from '@datreserve/shared-types';

const NICHES: { value: Niche; label: string }[] = [
  { value: Niche.BARBER, label: 'Barber' },
  { value: Niche.NAIL_ARTIST, label: 'Nail Artist' },
  { value: Niche.CONSULTANT, label: 'Consultant' },
  { value: Niche.MASSAGE, label: 'Massage Therapist' },
  { value: Niche.PERSONAL_TRAINER, label: 'Personal Trainer' },
  { value: Niche.OTHER, label: 'Other' },
];

export default function OnboardingStage1() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', companyName: '',
    slug: '', country: '', phoneNumber: '', niche: '' as Niche,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.patch('me/onboarding/stage1', { json: form });
      router.push('/onboarding/stage-2');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-medium text-accent">Step 1 of 4</span>
      </div>
      <h1 className="mb-1 font-serif text-2xl text-text-primary">Tell us about yourself</h1>
      <p className="mb-8 text-sm text-text-secondary">This info powers your public booking page.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">First name</label>
            <input value={form.firstName} onChange={e => set('firstName', e.target.value)} required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Last name</label>
            <input value={form.lastName} onChange={e => set('lastName', e.target.value)} required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Business name (optional)</label>
          <input value={form.companyName} onChange={e => set('companyName', e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Your booking URL</label>
          <div className="flex items-center rounded-lg border border-border bg-surface">
            <span className="border-r border-border px-3 py-3 text-sm text-text-muted">datreserve.com/book/</span>
            <input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              required placeholder="your-name"
              className="flex-1 bg-transparent px-3 py-3 text-sm text-text-primary outline-none" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">What do you do?</label>
          <select value={form.niche} onChange={e => set('niche', e.target.value)} required
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent">
            <option value="">Select your niche</option>
            {NICHES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Country</label>
          <input value={form.country} onChange={e => set('country', e.target.value)} required placeholder="e.g. US, GB, HU"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-60">
          {loading ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
