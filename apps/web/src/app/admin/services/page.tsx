'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Clock, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';

type Service = {
  id: string;
  name: string;
  price: number;
  currency: string;
  durationValue: number;
  durationUnit: string;
  description?: string;
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('services').json<Service[]>()
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-serif text-2xl text-text-primary">Services</h1>
          <p className="text-sm text-text-secondary">Manage the services you offer to clients.</p>
        </div>
        <Link href="/admin/services/new"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover">
          <Plus size={16} /> New service
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="mb-2 text-text-secondary">No services yet</p>
          <p className="mb-6 text-sm text-text-muted">Create your first service to start accepting bookings.</p>
          <Link href="/admin/services/new"
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover">
            <Plus size={16} /> Create service
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(s => (
            <Link key={s.id} href={`/admin/services/${s.id}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent/40 hover:bg-surface-2">
              <div className="flex-1">
                <p className="font-medium text-text-primary">{s.name}</p>
                {s.description && <p className="mt-0.5 text-sm text-text-muted line-clamp-1">{s.description}</p>}
              </div>
              <div className="flex items-center gap-1 text-sm text-text-secondary">
                <Clock size={13} />
                {s.durationValue} {s.durationUnit}
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-text-primary">
                <DollarSign size={13} />
                {Number(s.price).toLocaleString()} {s.currency}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
