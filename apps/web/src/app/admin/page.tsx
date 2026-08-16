export default function AdminPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="mb-1 font-serif text-2xl text-text-primary">Calendar</h1>
        <p className="text-sm text-text-secondary">Your upcoming appointments.</p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <p className="mb-2 text-text-secondary">No appointments yet</p>
        <p className="text-sm text-text-muted">Share your booking page to start receiving appointments.</p>
      </div>
    </div>
  );
}
