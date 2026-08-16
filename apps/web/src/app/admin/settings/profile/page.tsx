'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type Profile = {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phoneNumber?: string;
  description?: string;
  slug?: string;
  country?: string;
};

export default function ProfileSettingsPage() {
  const [form, setForm] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('me').json<Profile>()
      .then(data => {
        setForm({
          firstName:   data.firstName   ?? '',
          lastName:    data.lastName    ?? '',
          companyName: data.companyName ?? '',
          phoneNumber: data.phoneNumber ?? '',
          description: data.description ?? '',
          slug:        data.slug        ?? '',
          country:     data.country     ?? '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function set(key: keyof Profile, val: string) {
    setForm(f => ({ ...f, [key]: val }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch('settings/profile', { json: form });
      setSaved(true);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-6 w-32 animate-pulse rounded bg-surface-2" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-1 font-serif text-2xl text-text-primary">Profile</h1>
        <p className="text-sm text-text-secondary">Manage your public profile information.</p>
      </div>

      <form onSubmit={handleSave} className="max-w-lg space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">First name</label>
            <input value={form.firstName ?? ''} onChange={e => set('firstName', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Last name</label>
            <input value={form.lastName ?? ''} onChange={e => set('lastName', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Business name</label>
          <input value={form.companyName ?? ''} onChange={e => set('companyName', e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Phone number</label>
          <input value={form.phoneNumber ?? ''} onChange={e => set('phoneNumber', e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Bio</label>
          <textarea rows={4} value={form.description ?? ''} onChange={e => set('description', e.target.value)}
            className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={saving}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-60">
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
