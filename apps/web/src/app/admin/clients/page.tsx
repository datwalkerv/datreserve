'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, User } from 'lucide-react';
import { api } from '@/lib/api';

type Client = {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  bookingsCount: number;
  lastAppointment?: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('clients').json<Client[]>()
      .then(setClients)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-serif text-2xl text-text-primary">Clients</h1>
          <p className="text-sm text-text-secondary">Your client roster and booking history.</p>
        </div>
        <Link href="/admin/clients/new"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover">
          <Plus size={16} /> Add client
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="mb-2 text-text-secondary">No clients yet</p>
          <p className="text-sm text-text-muted">Clients are added automatically when bookings are made, or manually here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map(c => (
            <Link key={c.id} href={`/admin/clients/${c.id}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent/40 hover:bg-surface-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2">
                <User size={15} className="text-text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary">{c.name}</p>
                <p className="text-sm text-text-muted truncate">{c.email || c.phoneNumber || '—'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-text-secondary">{c.bookingsCount} booking{c.bookingsCount !== 1 ? 's' : ''}</p>
                {c.lastAppointment && (
                  <p className="text-xs text-text-muted">
                    Last: {new Date(c.lastAppointment).toLocaleDateString()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
