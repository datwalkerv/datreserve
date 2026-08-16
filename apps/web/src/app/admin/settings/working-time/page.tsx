'use client';
import { useState } from 'react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const defaultHours = DAYS.map((_, i) => ({
  weekday: i, isOpen: i >= 1 && i <= 5, startTime: '09:00', endTime: '18:00', slotIntervalMinutes: 30,
}));

export default function WorkingTimePage() {
  const [hours, setHours] = useState(defaultHours);

  function toggle(idx: number) {
    setHours(h => h.map((d, i) => i === idx ? { ...d, isOpen: !d.isOpen } : d));
  }
  function setField(idx: number, key: string, val: string | number) {
    setHours(h => h.map((d, i) => i === idx ? { ...d, [key]: val } : d));
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-1 font-serif text-2xl text-text-primary">Working time</h1>
        <p className="text-sm text-text-secondary">Set your availability for each day of the week.</p>
      </div>

      <div className="max-w-2xl space-y-2">
        {hours.map((day, i) => (
          <div key={i} className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${day.isOpen ? 'border-border bg-surface' : 'border-border/50 bg-background opacity-60'}`}>
            <button onClick={() => toggle(i)}
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${day.isOpen ? 'border-accent bg-accent' : 'border-border'}`}>
              {day.isOpen && <span className="text-xs text-black">✓</span>}
            </button>
            <span className="w-24 text-sm text-text-secondary">{DAYS[i]}</span>
            {day.isOpen ? (
              <>
                <input type="time" value={day.startTime} onChange={e => setField(i, 'startTime', e.target.value)}
                  className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent" />
                <span className="text-text-muted">–</span>
                <input type="time" value={day.endTime} onChange={e => setField(i, 'endTime', e.target.value)}
                  className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent" />
                <select value={day.slotIntervalMinutes} onChange={e => setField(i, 'slotIntervalMinutes', +e.target.value)}
                  className="ml-auto rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent">
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={60}>60 min</option>
                </select>
              </>
            ) : (
              <span className="text-sm text-text-muted">Closed</span>
            )}
          </div>
        ))}
      </div>

      <button className="mt-6 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover">
        Save
      </button>
    </div>
  );
}
