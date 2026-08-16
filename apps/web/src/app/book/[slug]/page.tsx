import { notFound } from 'next/navigation';

async function getPublicProfile(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/public/${slug}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function BookingProfilePage({ params }: { params: { slug: string } }) {
  const data = await getPublicProfile(params.slug);
  if (!data) notFound();

  const { profile, services } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <div
          className="h-40 w-full bg-surface-2"
          style={profile.coverImageUrl ? {
            backgroundImage: `url(${profile.coverImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}}
        />
        <div className="absolute bottom-0 left-6 translate-y-1/2">
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-background bg-surface">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt={profile.firstName} className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-text-secondary">{profile.firstName?.[0] ?? '?'}</div>
            }
          </div>
        </div>
      </div>

      <div className="px-6 pt-14">
        <div className="mb-6">
          <h1 className="font-serif text-2xl text-text-primary">
            {profile.firstName} {profile.lastName}
          </h1>
          {profile.companyName && <p className="mt-0.5 text-sm text-text-secondary">{profile.companyName}</p>}
          {profile.description && <p className="mt-3 text-sm leading-relaxed text-text-secondary">{profile.description}</p>}

          {profile.socials && (
            <div className="mt-3 flex gap-3">
              {profile.socials.instagram && (
                <a href={`https://instagram.com/${profile.socials.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-accent">Instagram</a>
              )}
              {profile.socials.website && (
                <a href={profile.socials.website} target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-accent">Website</a>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">Services</h2>
          <div className="space-y-3">
            {services.length === 0 && (
              <p className="text-sm text-text-muted">No services available yet.</p>
            )}
            {services.map((s: any) => (
              <a key={s.id} href={`/book/${params.slug}/${s.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/50">
                <div>
                  <p className="font-medium text-text-primary">{s.name}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{s.durationValue} {s.durationUnit}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-text-primary">{s.currency || ''} {Number(s.price).toFixed(2)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <p className="mt-10 pb-6 text-center text-xs text-text-muted">
          Powered by <span className="text-accent">datreserve</span>
        </p>
      </div>
    </div>
  );
}
