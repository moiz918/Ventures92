'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { logout, type CurrentUser } from '@/services/authService';

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.25" />
        <rect x="9" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.25" />
        <rect x="1" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.25" />
        <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    ),
  },
  {
    href: '/admin/properties',
    label: 'Properties',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M1 7l7-6 7 6v7H10v-4H6v4H1V7z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/projects',
    label: 'Projects',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="4" width="14" height="10" stroke="currentColor" strokeWidth="1.25" />
        <path d="M5 4V2.5a1 1 0 011-1h4a1 1 0 011 1V4" stroke="currentColor" strokeWidth="1.25" />
        <path d="M1 8h14" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    ),
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ pathname, isOpen, onClose }: { pathname: string; isOpen: boolean; onClose: () => void }) {
  return (
    <aside
      className={`admin-sidebar${isOpen ? ' is-open' : ''}`}
      style={{
        width: '240px',
        flexShrink: 0,
        backgroundColor: '#100e08',
        borderRight: '1px solid #4d4637',
        position: 'sticky',
        top: 0,
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #4d4637' }}>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#4d4637',
            margin: '0 0 4px',
          }}
        >
          Ventures 92
        </p>
        <p
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            margin: 0,
          }}
        >
          Admin Portal
        </p>
      </div>

      <nav style={{ flex: 1, padding: '16px 0' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <SidebarLink
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={active}
                  onClick={onClose}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ padding: '16px 24px', borderTop: '1px solid #4d4637' }}>
        <Link
          href="/"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-manrope)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#99907e',
            textDecoration: 'none',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Site
        </Link>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '11px 24px',
        fontFamily: 'var(--font-manrope)',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: active ? '#C9A84C' : '#99907e',
        textDecoration: 'none',
        transition: 'color 0.15s',
        borderLeft: `4px solid ${active ? '#C9A84C' : 'transparent'}`,
        paddingLeft: '20px',
        backgroundColor: active ? 'rgba(201,168,76,0.04)' : 'transparent',
      }}
    >
      {icon}
      {label}
    </Link>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function AdminHeader({
  user,
  onMenuClick,
  onLogout,
  isLoggingOut,
}: {
  user: CurrentUser;
  onMenuClick: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();
  return (
    <header
      style={{
        height: '56px',
        borderBottom: '1px solid #4d4637',
        backgroundColor: '#1e1b15',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: '16px',
        flexShrink: 0,
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuClick}
          className="admin-mobile-toggle"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            border: '1px solid #4d4637',
            backgroundColor: 'transparent',
            color: '#C9A84C',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid #4d4637',
            backgroundColor: '#2d2a23',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C9A84C',
            flexShrink: 0,
            fontFamily: 'var(--font-manrope)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}
        >
          {initials || 'AD'}
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#e9e1d7',
              margin: 0,
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '60vw',
            }}
          >
            {user.first_name} {user.last_name}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '10px',
              color: user.role === 'SUPER_ADMIN' ? '#C9A84C' : '#99907e',
              margin: '2px 0 0',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Agent'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #4d4637',
          color: '#99907e',
          backgroundColor: 'transparent',
          fontFamily: 'var(--font-manrope)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '8px 14px',
          cursor: isLoggingOut ? 'wait' : 'pointer',
          flexShrink: 0,
          opacity: isLoggingOut ? 0.6 : 1,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 2H2v12h4M10 5l4 3-4 3M14 8H6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {isLoggingOut ? 'Signing Out…' : 'Logout'}
      </button>
    </header>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function AdminShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // Even if the request fails, clear client-side state and redirect.
    }
    // Hard navigation so middleware sees the cleared cookies.
    window.location.assign('/login');
    // Fallback: in case window.location.assign is not invoked (SSR/test).
    router.replace('/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', position: 'relative' }}>
      <div
        className={`admin-mobile-backdrop${mobileOpen ? ' is-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />
      <Sidebar
        pathname={pathname}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AdminHeader
          user={user}
          onMenuClick={() => setMobileOpen((v) => !v)}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
        <main
          style={{
            flex: 1,
            backgroundColor: '#16130d',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
