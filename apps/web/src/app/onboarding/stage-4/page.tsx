'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Theme } from '@datreserve/shared-types';

const THEMES: { value: Theme; label: string; bg: string; surface: string }[] = [
  { value: Theme.OBSIDIAN, label: 'Obsidian', bg: '#0A0A0A', surface: '#111111' },
  { value: Theme.FOREST, label: 'Forest', bg: '#0A0F0A', surface: '#0F1A0F' },
  { value: Theme.MIDNIGHT, label: 'Midnight', bg: '#080810', surface: '#0F0F1A' },
  { value: Theme.MONO, label: 'Mono', bg: '#0D0D0D', surface: '#1A1A1A' },
  { value: Theme.SLATE, label: 'Slate', bg: '#0A0C10', surface: '#12151A' },
  { value: Theme.CARBON, label: 'Carbon', bg: '#0C0C0C', surface: '#161616' },
];

export default function OnboardingStage4() {
  const router = useRouter();
  const [selected, setSelected] = useState<Theme>(Theme.OBSIDIAN);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('me/onboarding/stage4', { json: { theme: selected } });
      document.cookie = 'onboarding_stage=complete; path=/';
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-2">
        <span className="text-xs font-medium text-accent">Step 4 of 4</span>
      </div>
      <h1 className="mb-1 font-serif text-2xl text-text-primary">Choose your theme</h1>
      <p className="mb-8 text-sm text-text-secondary">Pick the look for your public booking page.</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-8 grid grid-cols-3 gap-3">
          {THEMES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelected(t.value)}
              className={`relative rounded-xl border-2 p-4 transition-all ${
                selected === t.value ? 'border-accent' : 'border-border hover:border-surface-2'
              }`}
              style={{ background: t.bg }}
            >
              <div className="mb-2 h-8 rounded" style={{ background: t.surface }} />
              <div className="h-1.5 w-3/4 rounded" style={{ background: '#39FF6A', opacity: 0.8 }} />
              <p className="mt-2 text-xs text-text-secondary">{t.label}</p>
            </button>
          ))}
        </div>

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover disabled:opacity-60">
          {loading ? 'Saving…' : 'Finish setup'}
        </button>
      </form>
    </div>
  );
}
