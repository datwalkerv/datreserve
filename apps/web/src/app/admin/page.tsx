'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

type WorkingHours = {
  weekday: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
};

type Appointment = {
  id: string;
  clientName: string;
  startAt: string;
  endAt: string;
  status: string;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const HOUR_START = 7;
const HOUR_END = 22;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const ROW_HEIGHT = 56;

// YYYY-MM-DD of a Date in a given timezone
function dateStrInTZ(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(date);
}

// Weekday (0=Sun) of a YYYY-MM-DD string in a given timezone
function weekdayOfStr(dateStr: string, tz: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const noon = new Date(Date.UTC(y, m - 1, d, 12));
  const name = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(noon);
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(name);
}

// Add n days to a YYYY-MM-DD string
function addDaysToStr(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + n));
  return date.toISOString().slice(0, 10);
}

// Sunday-anchored start of week for a YYYY-MM-DD string
function startOfWeekStr(dateStr: string, tz: string): string {
  return addDaysToStr(dateStr, -weekdayOfStr(dateStr, tz));
}

// Decimal hours (e.g. 11.5 for 11:30) of a UTC ISO string in a given timezone
function hourInTZ(isoStr: string, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(isoStr));
  const h = parseInt(parts.find(p => p.type === 'hour')!.value) % 24;
  const m = parseInt(parts.find(p => p.type === 'minute')!.value);
  return h + m / 60;
}

// Create a Date at noon UTC from a YYYY-MM-DD string (safe for .getDay()/.getDate() display)
function noonUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export default function AdminPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timezone, setTimezone] = useState('UTC');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    api.get('me').json<{ timezone?: string }>()
      .then(data => { if (data?.timezone) setTimezone(data.timezone); })
      .catch(() => {});
    api.get('me/working-hours').json<WorkingHours[]>()
      .then(setWorkingHours)
      .catch(() => {});
  }, []);

  const todayStr = dateStrInTZ(new Date(), timezone);
  const weekStartStr = addDaysToStr(startOfWeekStr(todayStr, timezone), weekOffset * 7);
  const dayStrs = Array.from({ length: 7 }, (_, i) => addDaysToStr(weekStartStr, i));

  useEffect(() => {
    // Fetch with a 1-day buffer on each side to handle any UTC offset
    const from = addDaysToStr(weekStartStr, -1) + 'T00:00:00Z';
    const to = addDaysToStr(weekStartStr, 8) + 'T00:00:00Z';
    api.get(`appointments?from=${from}&to=${to}`).json<Appointment[]>()
      .then(setAppointments)
      .catch(() => {});
  }, [weekOffset, timezone]);

  const hoursMap = new Map<number, WorkingHours>();
  for (const wh of workingHours) hoursMap.set(wh.weekday, wh);

  const weekEndStr = addDaysToStr(weekStartStr, 6);
  const startMonth = parseInt(weekStartStr.slice(5, 7)) - 1;
  const endMonth = parseInt(weekEndStr.slice(5, 7)) - 1;
  const year = parseInt(weekStartStr.slice(0, 4));
  const monthLabel = startMonth === endMonth
    ? `${MONTHS[startMonth]} ${year}`
    : `${MONTHS[startMonth]} – ${MONTHS[endMonth]} ${year}`;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="font-serif text-2xl text-text-primary">Calendar</h1>
          <p className="text-sm text-text-secondary">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface hover:text-text-primary"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="rounded-lg border border-border p-1.5 text-text-secondary hover:bg-surface hover:text-text-primary"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="rounded-lg border border-border p-1.5 text-text-secondary hover:bg-surface hover:text-text-primary"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="flex shrink-0 border-b border-border">
        <div className="w-14 shrink-0" />
        {dayStrs.map((dayStr, i) => {
          const d = noonUTC(dayStr);
          const isToday = dayStr === todayStr;
          return (
            <div key={i} className="flex flex-1 flex-col items-center py-2">
              <span className="text-xs text-text-muted">{DAY_LABELS[d.getUTCDay()]}</span>
              <span className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                isToday ? 'bg-accent text-black' : 'text-text-primary'
              }`}>
                {d.getUTCDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-y-auto">
        {/* Hour labels */}
        <div className="w-14 shrink-0">
          {Array.from({ length: TOTAL_HOURS }, (_, i) => i + HOUR_START).map(h => (
            <div key={h} style={{ height: ROW_HEIGHT }} className="flex items-start justify-end pr-2 pt-1">
              <span className="text-[10px] text-text-muted">{formatHour(h)}</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {dayStrs.map((dayStr, di) => {
          const d = noonUTC(dayStr);
          const wh = hoursMap.get(d.getUTCDay());
          const isOpen = wh?.isOpen ?? false;
          const startMin = isOpen ? toMinutes(wh!.startTime) : 0;
          const endMin = isOpen ? toMinutes(wh!.endTime) : 0;

          const dayAppts = appointments.filter(a => dateStrInTZ(new Date(a.startAt), timezone) === dayStr);

          return (
            <div key={di} className="relative flex-1 border-l border-border">
              {/* Hour rows */}
              {Array.from({ length: TOTAL_HOURS }, (_, i) => {
                const h = i + HOUR_START;
                const rowStartMin = h * 60;
                const rowEndMin = (h + 1) * 60;
                const isWorking = isOpen && rowStartMin >= startMin && rowEndMin <= endMin;
                return (
                  <div
                    key={h}
                    style={{ height: ROW_HEIGHT }}
                    className={`border-b border-border ${isWorking ? 'bg-background' : 'bg-surface-2'}`}
                  />
                );
              })}

              {/* Working hours bracket */}
              {isOpen && (
                <div
                  className="pointer-events-none absolute left-0 right-0"
                  style={{
                    top: (startMin / 60 - HOUR_START) * ROW_HEIGHT,
                    height: ((endMin - startMin) / 60) * ROW_HEIGHT,
                  }}
                />
              )}

              {/* Current time line — today's column only */}
              {dayStr === todayStr && (() => {
                const nowHour = hourInTZ(now.toISOString(), timezone);
                const top = (nowHour - HOUR_START) * ROW_HEIGHT;
                if (top < 0 || top > TOTAL_HOURS * ROW_HEIGHT) return null;
                return (
                  <div className="pointer-events-none absolute left-0 right-0 z-10" style={{ top }}>
                    <div className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white" />
                    <div className="h-px bg-white opacity-80" />
                  </div>
                );
              })()}

              {/* Appointment blocks */}
              {dayAppts.map(appt => {
                const startHour = hourInTZ(appt.startAt, timezone);
                const endHour = hourInTZ(appt.endAt, timezone);
                const top = (startHour - HOUR_START) * ROW_HEIGHT;
                const height = Math.max((endHour - startHour) * ROW_HEIGHT, 22);
                if (top < 0 || top > TOTAL_HOURS * ROW_HEIGHT) return null;
                return (
                  <div
                    key={appt.id}
                    className="absolute left-1 right-1 overflow-hidden rounded-md px-2 py-1 text-xs"
                    style={{ top, height, background: 'color-mix(in srgb, var(--color-accent) 18%, var(--color-surface-2))' }}
                  >
                    <div className="mb-0.5 h-0.5 w-6 rounded-full bg-accent opacity-90" />
                    <p className="truncate font-semibold text-accent">{appt.clientName}</p>
                    {height >= 40 && (
                      <p className="truncate text-accent/70">
                        {new Date(appt.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: timezone })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
