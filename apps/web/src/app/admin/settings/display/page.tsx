'use client';
import { useState } from 'react';
import { Theme } from '@datreserve/shared-types';

const THEMES: { value: Theme; label: string; bg: string; surface: string }[] = [
  { value: Theme.OBSIDIAN, label: 'Obsidian', bg: '#0A0A0A', surface: '#111111' },
  { value: Theme.FOREST, label: 'Forest', bg: '#0A0F0A', surface: '#0F1A0F' },
  { value: Theme.MIDNIGHT, label: 'Midnight', bg: '#080810', surface: '#0F0F1A' },
  { value: Theme.MONO, label: 'Mono', bg: '#0D0D0D', surface: '#1A1A1A' },
  { value: Theme.SLATE, label: 'Slate', bg: '#0A0C10', surface: '#12151A' },
  { value: Theme.CARBON, label: 'Carbon', bg: '#0C0C0C', surface: '#161616' },
];

export default function DisplaySettingsPage() {
  const [selected, setSelected] = useState<Theme>(Theme.OBSIDIAN);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-1 font-serif text-2xl text-text-primary">Display</h1>
        <p className="text-sm text-text-secondary">Choose the theme for your public booking page.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-lg">
        {THEMES.map(t => (
          <button key={t.value} onClick={() => setSelected(t.value)}
            className={`relative rounded-xl border-2 p-4 transition-all ${selected === t.value ? 'border-accent' : 'border-border hover:border-surface-2'}`}
            style={{ background: t.bg }}>
            <div className="mb-2 h-8 rounded" style={{ background: t.surface }} />
            <div className="h-1.5 w-3/4 rounded" style={{ background: '#39FF6A', opacity: 0.8 }} />
            <p className="mt-2 text-left text-xs text-text-secondary">{t.label}</p>
          </button>
        ))}
      </div>

      <button className="mt-6 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover">
        Save theme
      </button>
    </div>
  );
}
