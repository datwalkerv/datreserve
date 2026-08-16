'use client';
import { useState } from 'react';

export default function RulesPage() {
  const [windowDays, setWindowDays] = useState(30);
  const [cutoffHours, setCutoffHours] = useState(3);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-1 font-serif text-2xl text-text-primary">Booking rules</h1>
        <p className="text-sm text-text-secondary">Control how far in advance clients can book.</p>
      </div>

      <div className="max-w-md space-y-6">
        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Booking window</label>
          <p className="mb-3 text-xs text-text-muted">How many days in advance clients can book.</p>
          <div className="flex items-center gap-3">
            <input type="number" min={1} max={365} value={windowDays} onChange={e => setWindowDays(+e.target.value)}
              className="w-24 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
            <span className="text-sm text-text-secondary">days</span>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-text-secondary">Booking cutoff</label>
          <p className="mb-3 text-xs text-text-muted">Minimum notice required before an appointment.</p>
          <div className="flex items-center gap-3">
            <input type="number" min={0} max={72} value={cutoffHours} onChange={e => setCutoffHours(+e.target.value)}
              className="w-24 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
            <span className="text-sm text-text-secondary">hours</span>
          </div>
        </div>

        <button className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover">
          Save rules
        </button>
      </div>
    </div>
  );
}
