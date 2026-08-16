'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut, useSession } from '@/lib/auth-client';
import { api } from '@/lib/api';
import {
  Calendar, Settings, Scissors, Users, ChevronDown, ChevronRight,
  ExternalLink, LogOut, User, Clock, Paintbrush, SlidersHorizontal,
} from 'lucide-react';

const SETTINGS_CHILDREN = [
  { href: '/admin/settings/profile',      label: 'Profile',       icon: User             },
  { href: '/admin/settings/display',      label: 'Display',       icon: Paintbrush       },
  { href: '/admin/settings/working-time', label: 'Working time',  icon: Clock            },
  { href: '/admin/settings/rules',        label: 'Rules',         icon: SlidersHorizontal },
];

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: React.ElementType; label: string; active: boolean }) {
  return (
    <Link href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        active ? 'bg-surface-2 text-text-primary' : 'text-text-secondary hover:bg-surface hover:text-text-primary'
      }`}>
      <Icon size={16} />
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith('/admin/settings'));
  const [profile, setProfile] = useState<{ slug?: string; avatarUrl?: string; theme?: string } | null>(null);

  useEffect(() => {
    api.get('me').json<{ slug?: string; avatarUrl?: string; theme?: string }>()
      .then(data => {
        setProfile(data);
        if (data?.theme) document.documentElement.setAttribute('data-theme', data.theme);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await signOut();
    router.push('/login');
  }

  const reservationUrl = profile?.slug ? `/book/${profile.slug}` : null;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-60 flex-col border-r border-border">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
              <span className="font-sans text-xs font-black text-black">dr</span>
            </div>
            <span className="font-sans text-sm font-semibold text-text-primary">datreserve</span>
          </div>
        </div>

        <div className="px-3 pb-4">
          {reservationUrl ? (
            <Link href={reservationUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10">
              <ExternalLink size={14} />
              Your reservation page
            </Link>
          ) : (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-text-muted">
              <ExternalLink size={14} />
              Your reservation page
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          <NavItem href="/admin" icon={Calendar} label="Calendar" active={pathname === '/admin'} />

          <div>
            <button onClick={() => setSettingsOpen(o => !o)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                pathname.startsWith('/admin/settings') ? 'bg-surface-2 text-text-primary' : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              }`}>
              <Settings size={16} />
              <span className="flex-1 text-left">Settings</span>
              {settingsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {settingsOpen && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-border pl-3">
                {SETTINGS_CHILDREN.map(({ href, label, icon: Icon }) => (
                  <NavItem key={href} href={href} icon={Icon} label={label} active={pathname === href} />
                ))}
              </div>
            )}
          </div>

          <NavItem href="/admin/services" icon={Scissors} label="Services" active={pathname.startsWith('/admin/services')} />
          <NavItem href="/admin/clients"  icon={Users}    label="Clients"  active={pathname.startsWith('/admin/clients')}  />
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-2">
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center text-xs text-text-secondary">
                    {session?.user?.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-text-primary">{session?.user?.name ?? 'User'}</p>
              <p className="truncate text-xs text-text-muted">{session?.user?.email ?? ''}</p>
            </div>
            <button onClick={handleLogout} className="shrink-0 text-text-muted hover:text-text-secondary">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
