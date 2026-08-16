import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ServicesPage() {
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

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <p className="mb-2 text-text-secondary">No services yet</p>
        <p className="mb-6 text-sm text-text-muted">Create your first service to start accepting bookings.</p>
        <Link href="/admin/services/new"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-accent-hover">
          <Plus size={16} /> Create service
        </Link>
      </div>
    </div>
  );
}
