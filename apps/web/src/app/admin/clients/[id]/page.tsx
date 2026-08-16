export default function ClientDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-text-primary">Client</h1>
      <p className="mt-2 text-sm text-text-secondary">Client ID: {params.id} — detail view coming soon.</p>
    </div>
  );
}
