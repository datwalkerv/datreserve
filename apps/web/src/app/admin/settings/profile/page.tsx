'use client';
import { useState } from 'react';

export default function ProfileSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-1 font-serif text-2xl text-text-primary">Profile</h1>
        <p className="text-sm text-text-secondary">Manage your public profile information.</p>
      </div>

      <div className="max-w-lg space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">First name</label>
            <input className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Last name</label>
            <input className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Bio</label>
          <textarea rows={4} className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
        </div>
        <button onClick={() => setSaved(true)}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover">
          {saved ? 'Saved' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
