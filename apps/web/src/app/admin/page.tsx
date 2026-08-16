'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

type WorkingHours = {
  weekday: number; // 0=Sun, 1=Mon … 6=Sat
  isOpen: boolean;
  startTime: string; // "HH:MM"
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
const HOUR_START = 7;
const HOUR_END = 22;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const ROW_HEIGHT = 56; // px per hour

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
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

function apptTop(startAt: Date): number {
  const h = startAt.getHours() + startAt.getMinutes() / 60;
  return (h - HOUR_START) * ROW_HEIGHT;
}

function apptHeight(startAt: Date, endAt: Date): number {
  const diffMin = (endAt.getTime() - startAt.getTime()) / 60000;
  return (diffMin / 60) * ROW_HEIGHT;
}

export default function AdminPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const baseWeek = startOfWeek(today);
  const weekStart = addDays(baseWeek, weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    api.get('me/working-hours').json<WorkingHours[]>()
      .then(setWorkingHours)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const from = weekStart.toISOString();
    const to = addDays(weekStart, 7).toISOString();
    api.get(`appointments?from=${from}&to=${to}`).json<Appointment[]>()
      .then(setAppointments)
      .catch(() => {});
  }, [weekOffset]);

  const hoursMap = new Map<number, WorkingHours>();
  for (const wh of workingHours) hoursMap.set(wh.weekday, wh);

  const monthLabel = (() => {
    const months = weekStart.getMonth() !== addDays(weekStart, 6).getMonth()
      ? `${weekStart.toLocaleString('default', { month: 'long' })} – ${addDays(weekStart, 6).toLocaleString('default', { month: 'long' })} ${weekStart.getFullYear()}`
      : `${weekStart.toLocaleString('default', { month: 'long' })} ${weekStart.getFullYear()}`;
    return months;
  })();

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
        {days.map((day, i) => {
          const isToday = day.getTime() === today.getTime();
          return (
            <div key={i} className="flex flex-1 flex-col items-center py-2">
              <span className="text-xs text-text-muted">{DAY_LABELS[day.getDay()]}</span>
              <span className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                isToday ? 'bg-accent text-black' : 'text-text-primary'
              }`}>
                {day.getDate()}
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
        {days.map((day, di) => {
          const wh = hoursMap.get(day.getDay());
          const isOpen = wh?.isOpen ?? false;
          const startMin = isOpen ? toMinutes(wh!.startTime) : 0;
          const endMin = isOpen ? toMinutes(wh!.endTime) : 0;

          // Appointments for this day
          const dayAppts = appointments.filter(a => {
            const d = new Date(a.startAt);
            d.setHours(0, 0, 0, 0);
            return d.getTime() === day.getTime();
          });

          return (
            <div key={di} className="relative flex-1 border-l border-border">
              {/* Hour rows — background */}
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

              {/* Working hours bracket (if open) */}
              {isOpen && (
                <div
                  className="pointer-events-none absolute left-0 right-0"
                  style={{
                    top: ((startMin / 60 - HOUR_START) * ROW_HEIGHT),
                    height: ((endMin - startMin) / 60 * ROW_HEIGHT),
                  }}
                />
              )}

              {/* Appointment blocks */}
              {dayAppts.map(appt => {
                const start = new Date(appt.startAt);
                const end = new Date(appt.endAt);
                const top = apptTop(start);
                const height = Math.max(apptHeight(start, end), 22);
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
                        {new Date(appt.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
