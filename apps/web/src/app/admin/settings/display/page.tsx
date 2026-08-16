'use client';
import { useState, useEffect } from 'react';
import { Theme } from '@datreserve/shared-types';
import { api } from '@/lib/api';

const THEMES: { value: Theme; label: string; bg: string; surface: string; accent: string }[] = [
  { value: Theme.OBSIDIAN, label: 'Obsidian', bg: '#0A0A0A', surface: '#1A1A1A', accent: '#39FF6A' },
  { value: Theme.FOREST,   label: 'Forest',   bg: '#040C04', surface: '#0F2010', accent: '#4ADE80' },
  { value: Theme.MIDNIGHT, label: 'Midnight', bg: '#04040F', surface: '#10102A', accent: '#818CF8' },
  { value: Theme.MONO,     label: 'Mono',     bg: '#0C0C0C', surface: '#252525', accent: '#E5E5E5' },
  { value: Theme.SLATE,    label: 'Slate',    bg: '#060C14', surface: '#121C2E', accent: '#38BDF8' },
  { value: Theme.CARBON,   label: 'Carbon',   bg: '#0A0A0A', surface: '#222222', accent: '#FB923C' },
];

function applyTheme(value: Theme) {
  document.documentElement.setAttribute('data-theme', value);
}

export default function DisplaySettingsPage() {
  const [selected, setSelected] = useState<Theme>(Theme.OBSIDIAN);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('me').json<{ theme?: Theme }>()
      .then(data => {
        const t = data?.theme ?? Theme.OBSIDIAN;
        setSelected(t);
        applyTheme(t);
      })
      .catch(() => {});
  }, []);

  function handleSelect(t: Theme) {
    setSelected(t);
    setSaved(false);
    applyTheme(t);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch('settings/profile', { json: { theme: selected } });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-1 font-serif text-2xl text-text-primary">Display</h1>
        <p className="text-sm text-text-secondary">Choose the theme for your admin panel and public booking page.</p>
      </div>

      <div className="grid max-w-lg grid-cols-3 gap-3">
        {THEMES.map(t => (
          <button key={t.value} onClick={() => handleSelect(t.value)}
            className={`rounded-xl border-2 p-3 transition-all ${selected === t.value ? 'border-accent' : 'border-border hover:border-surface-2'}`}
            style={{ background: t.bg }}>
            <div className="mb-2 h-10 rounded-lg" style={{ background: t.surface }} />
            <div className="mb-2 flex gap-1">
              <div className="h-1.5 flex-1 rounded-full" style={{ background: t.accent }} />
              <div className="h-1.5 w-1/3 rounded-full" style={{ background: t.surface }} />
            </div>
            <p className="text-left text-xs" style={{ color: '#A0A0A0' }}>{t.label}</p>
          </button>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="mt-6 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-60">
        {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save theme'}
      </button>
    </div>
  );
}
