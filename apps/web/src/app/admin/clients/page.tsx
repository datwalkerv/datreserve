import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ClientsPage() {
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

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
        <p className="mb-2 text-text-secondary">No clients yet</p>
        <p className="text-sm text-text-muted">Clients are added automatically when bookings are made, or manually here.</p>
      </div>
    </div>
  );
}
