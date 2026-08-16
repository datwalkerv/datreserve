'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download } from 'lucide-react';

export default function CheckoutContent({ params }: { params: { slug: string; serviceId: string } }) {
  const searchParams = useSearchParams();
  const startAt = searchParams.get('startAt') || '';
  const endAt = searchParams.get('endAt') || '';

  const [step, setStep] = useState<'details' | 'overview' | 'confirmed'>('details');
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [icsUrl, setIcsUrl] = useState('');

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const startDate = startAt ? new Date(startAt) : null;
  const displayTime = startDate?.toLocaleString([], {
    weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function buildIcs(appt: any, start: Date, end: Date, serviceName: string, clientName: string) {
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const summary = `${serviceName} - ${clientName}`;
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `UID:${appt.icsUid || appt.id}@datreserve`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${summary}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  async function confirm() {
    setLoading(true);
    setError('');
    try {
      const [profileRes, bookingRes] = await Promise.all([
        fetch(`${apiBase}/public/${params.slug}`),
        fetch(`${apiBase}/public/${params.slug}/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: params.serviceId,
            startAt,
            clientName: form.name,
            clientEmail: form.email,
            clientPhone: form.phone,
            clientNotes: form.notes,
          }),
        }),
      ]);
      if (!bookingRes.ok) throw new Error('Booking failed');
      const appt = await bookingRes.json();
      const profileData = profileRes.ok ? await profileRes.json() : null;
      const service = profileData?.services?.find((s: any) => s.id === params.serviceId);
      const serviceName = service?.name || 'Appointment';
      const ics = buildIcs(appt, startDate!, new Date(endAt), serviceName, form.name);
      const blob = new Blob([ics], { type: 'text/calendar' });
      setIcsUrl(URL.createObjectURL(blob));
      setStep('confirmed');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'confirmed') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle size={48} className="text-accent" />
          </div>
          <h1 className="mb-2 font-serif text-2xl text-text-primary">{"You're booked!"}</h1>
          <p className="mb-2 text-sm text-text-secondary">{displayTime}</p>
          <p className="mb-8 text-sm text-text-muted">{"A confirmation has been noted. See you then!"}</p>
          {icsUrl && (
            <a href={icsUrl} download="appointment.ics"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm text-text-secondary hover:border-accent hover:text-accent">
              <Download size={16} /> Add to calendar
            </a>
          )}
        </div>
      </div>
    );
  }

  if (step === 'overview') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <h1 className="mb-6 font-serif text-2xl text-text-primary">Review booking</h1>
          <div className="mb-6 space-y-3 rounded-xl border border-border bg-surface p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">When</span>
              <span className="text-text-primary">{displayTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Name</span>
              <span className="text-text-primary">{form.name}</span>
            </div>
            {form.email && (
              <div className="flex justify-between">
                <span className="text-text-muted">Email</span>
                <span className="text-text-primary">{form.email}</span>
              </div>
            )}
            {form.phone && (
              <div className="flex justify-between">
                <span className="text-text-muted">Phone</span>
                <span className="text-text-primary">{form.phone}</span>
              </div>
            )}
          </div>
          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => setStep('details')}
              className="flex-1 rounded-lg border border-border py-3 text-sm text-text-secondary hover:border-accent">
              Back
            </button>
            <button onClick={confirm} disabled={loading}
              className="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-60">
              {loading ? 'Confirming…' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <a href={`/book/${params.slug}/${params.serviceId}`}
          className="mb-6 block text-sm text-text-secondary hover:text-text-primary">
          ← Back
        </a>
        <h1 className="mb-2 font-serif text-2xl text-text-primary">Your details</h1>
        <p className="mb-6 text-sm text-text-secondary">{displayTime}</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Phone</label>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent" />
          </div>
          <button onClick={() => { if (form.name) setStep('overview'); }} disabled={!form.name}
            className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-40">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
