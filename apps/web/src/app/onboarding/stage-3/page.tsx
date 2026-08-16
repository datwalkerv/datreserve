'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function OnboardingStage3() {
  const router = useRouter();
  const [form, setForm] = useState({
    description: '',
    hasLocation: false,
    locationText: '',
    socials: { instagram: '', facebook: '', tiktok: '', website: '' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, val: string | boolean) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function setSocial(key: string, val: string) {
    setForm(f => ({ ...f, socials: { ...f.socials, [key]: val } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.patch('me/onboarding/stage3', { json: form });
      router.push('/onboarding/stage-4');
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-medium text-accent">Step 3 of 4</span>
      </div>
      <h1 className="mb-1 font-serif text-2xl text-text-primary">About you</h1>
      <p className="mb-8 text-sm text-text-secondary">Help clients understand who you are.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">About you</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
            placeholder="Briefly describe your services and style…"
            className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Instagram</label>
          <input value={form.socials.instagram} onChange={e => setSocial('instagram', e.target.value)} placeholder="@handle"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Website</label>
          <input value={form.socials.website} onChange={e => setSocial('website', e.target.value)} placeholder="https://"
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="hasLocation" checked={form.hasLocation}
            onChange={e => set('hasLocation', e.target.checked)}
            className="h-4 w-4 accent-accent" />
          <label htmlFor="hasLocation" className="text-sm text-text-secondary">I have a physical location</label>
        </div>

        {form.hasLocation && (
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Address</label>
            <input value={form.locationText} onChange={e => set('locationText', e.target.value)}
              placeholder="Street, City, Country"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-60">
          {loading ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
