'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function BookingCalendarPage({ params }: { params: { slug: string; serviceId: string } }) {
  const router = useRouter();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<{ startAt: string; endAt: string }[]>([]);
  const [providerTZ, setProviderTZ] = useState<string>('UTC');
  const [selectedSlot, setSelectedSlot] = useState<{ startAt: string; endAt: string } | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(`${apiBase}/public/${params.slug}/availability?serviceId=${params.serviceId}&date=${formatDate(selectedDate)}`)
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data.slots)) {
          setSlots(data.slots);
          if (data.timezone) setProviderTZ(data.timezone);
        } else if (Array.isArray(data)) {
          setSlots(data); // backwards compat
        } else {
          setSlots([]);
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleContinue() {
    if (!selectedSlot) return;
    const qs = new URLSearchParams({ startAt: selectedSlot.startAt, endAt: selectedSlot.endAt }).toString();
    router.push(`/book/${params.slug}/${params.serviceId}/checkout?${qs}`);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <a href={`/book/${params.slug}`} className="mb-6 flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
          <ChevronLeft size={16} /> Back
        </a>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={prevMonth} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-2"><ChevronLeft size={18} /></button>
              <span className="text-sm font-medium text-text-primary">{MONTHS[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-2"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {DAYS.map(d => <div key={d} className="py-1 text-center text-xs text-text-muted">{d}</div>)}
              {cells.map((date, i) => {
                if (!date) return <div key={i} />;
                const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
                return (
                  <button key={i} disabled={isPast} onClick={() => setSelectedDate(date)}
                    className={`rounded-lg py-1.5 text-sm transition-colors ${
                      isSelected ? 'bg-accent font-semibold text-black'
                      : isPast ? 'cursor-not-allowed text-text-muted'
                      : 'text-text-primary hover:bg-surface-2'
                    }`}>
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-4 text-sm font-medium text-text-secondary">
              {selectedDate ? `Available on ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}` : 'Select a date'}
            </h3>
            {!selectedDate && <p className="text-sm text-text-muted">Choose a date to see available times.</p>}
            {selectedDate && loadingSlots && <p className="text-sm text-text-muted">Loading…</p>}
            {selectedDate && !loadingSlots && slots.length === 0 && (
              <p className="text-sm text-text-muted">No availability on this day.</p>
            )}
            {selectedDate && !loadingSlots && slots.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {slots.map(slot => {
                  const time = new Date(slot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: providerTZ });
                  const isSel = selectedSlot?.startAt === slot.startAt;
                  return (
                    <button key={slot.startAt} onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg border py-2.5 text-sm transition-colors ${
                        isSel ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-primary hover:border-accent/50'
                      }`}>
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button disabled={!selectedSlot} onClick={handleContinue}
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-black hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
