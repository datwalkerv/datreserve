export default function EditServicePage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl text-text-primary">Edit service</h1>
      <p className="mt-2 text-sm text-text-secondary">Service ID: {params.id} — full edit form coming soon.</p>
    </div>
  );
}
