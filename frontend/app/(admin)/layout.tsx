import Link from 'next/link';
import { redirect } from 'next/navigation';

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    href: '/dashboard',
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
    href: '/properties',
    label: 'Properties',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M1 7l7-6 7 6v7H10v-4H6v4H1V7z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/projects',
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
    href: '/dashboard/settings',
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
function Sidebar() {
  return (
    <aside
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
      {/* Brand */}
      <div
        style={{
          padding: '28px 24px 20px',
          borderBottom: '1px solid #4d4637',
        }}
      >
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

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <SidebarLink href={item.href} label={item.label} icon={item.icon} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #4d4637',
        }}
      >
        <Link
          href="/"
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
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
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
        color: '#99907e',
        textDecoration: 'none',
        transition: 'color 0.15s',
      }}
      className="admin-nav-link"
    >
      {icon}
      {label}
    </Link>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function AdminHeader() {
  return (
    <header
      style={{
        height: '56px',
        borderBottom: '1px solid #4d4637',
        backgroundColor: '#1e1b15',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: '32px',
        flexShrink: 0,
      }}
    >
      {/* Admin identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.25" />
            <path d="M2 13.5c0-3.314 2.686-4.5 6-4.5s6 1.186 6 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#e9e1d7',
              margin: 0,
              lineHeight: 1,
            }}
          >
            Admin
          </p>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '10px',
              color: '#4d4637',
              margin: '2px 0 0',
              letterSpacing: '0.06em',
            }}
          >
            ventures92.com
          </p>
        </div>
      </div>

      {/* Logout */}
      <Link
        href="/login"
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
          padding: '8px 16px',
          textDecoration: 'none',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 2H2v12h4M10 5l4 3-4 3M14 8H6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Logout
      </Link>
    </header>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AdminHeader />
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
