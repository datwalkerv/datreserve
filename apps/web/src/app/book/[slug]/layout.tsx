async function getTheme(slug: string): Promise<string> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/public/${slug}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return 'theme-obsidian';
    const data = await res.json();
    return data.profile?.theme || 'theme-obsidian';
  } catch {
    return 'theme-obsidian';
  }
}

export default async function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const theme = await getTheme(params.slug);
  return (
    <div data-theme={theme} style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
