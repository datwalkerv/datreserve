'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Download, X } from 'lucide-react';

export default function CheckoutContent({ params }: { params: { slug: string; serviceId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startAt = searchParams.get('startAt') || '';
  const endAt = searchParams.get('endAt') || '';

  const [step, setStep] = useState<'details' | 'overview' | 'confirmed'>('details');
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    setErrors(e => ({ ...e, [key]: '' }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    const name = form.name.trim();
    if (!name) errs.name = 'Name is required.';
    else if (name.length < 2) errs.name = 'Name must be at least 2 characters.';
    else if (name.length > 100) errs.name = 'Name must be 100 characters or fewer.';

    const email = form.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';

    const phone = form.phone.trim();
    if (phone && !/^[+\d\s\-().]{7,30}$/.test(phone)) errs.phone = 'Enter a valid phone number.';

    if (form.notes.length > 500) errs.notes = 'Notes must be 500 characters or fewer.';

    return errs;
  }

  function goToOverview() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStep('overview');
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
            clientName: form.name.trim(),
            clientEmail: form.email.trim() || undefined,
            clientPhone: form.phone.trim() || undefined,
            clientNotes: form.notes.trim() || undefined,
          }),
        }),
      ]);
      if (!bookingRes.ok) throw new Error('Booking failed');
      const appt = await bookingRes.json();
      const profileData = profileRes.ok ? await profileRes.json() : null;
      const service = profileData?.services?.find((s: any) => s.id === params.serviceId);
      const serviceName = service?.name || 'Appointment';
      const ics = buildIcs(appt, startDate!, new Date(endAt), serviceName, form.name.trim());
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
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <button
          onClick={() => router.push(`/book/${params.slug}`)}
          className="absolute right-4 top-4 rounded-lg p-2 text-text-muted hover:bg-surface hover:text-text-primary"
        >
          <X size={20} />
        </button>
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
              <span className="text-text-primary">{form.name.trim()}</span>
            </div>
            {form.email.trim() && (
              <div className="flex justify-between">
                <span className="text-text-muted">Email</span>
                <span className="text-text-primary">{form.email.trim()}</span>
              </div>
            )}
            {form.phone.trim() && (
              <div className="flex justify-between">
                <span className="text-text-muted">Phone</span>
                <span className="text-text-primary">{form.phone.trim()}</span>
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
            <label className="mb-1.5 block text-sm text-text-secondary">Name <span className="text-red-400">*</span></label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              maxLength={100}
              className={`w-full rounded-lg border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent ${errors.name ? 'border-red-400' : 'border-border'}`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              maxLength={254}
              className={`w-full rounded-lg border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent ${errors.email ? 'border-red-400' : 'border-border'}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              maxLength={30}
              className={`w-full rounded-lg border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent ${errors.phone ? 'border-red-400' : 'border-border'}`}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-text-secondary">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              maxLength={500}
              className={`w-full resize-none rounded-lg border bg-surface px-4 py-3 text-sm text-text-primary outline-none focus:border-accent ${errors.notes ? 'border-red-400' : 'border-border'}`}
            />
            <div className="mt-1 flex justify-between">
              {errors.notes ? <p className="text-xs text-red-400">{errors.notes}</p> : <span />}
              <p className="text-xs text-text-muted">{form.notes.length}/500</p>
            </div>
          </div>
          <button
            onClick={goToOverview}
            className="w-full rounded-lg bg-accent py-3 text-sm font-semibold text-black hover:bg-accent-hover">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
