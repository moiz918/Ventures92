'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/services/authService';
import type { CurrentUser } from '@/services/authService';

interface Props {
  user: CurrentUser | null;
}

// Shared text style for both auth buttons
const AUTH_LINK_BASE: React.CSSProperties = {
  fontFamily: 'var(--font-manrope)',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  display: 'inline-flex',
  alignItems: 'center',
};

export default function AuthNav({ user }: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // Swallow — cookies may already be expired; we still navigate away.
    } finally {
      // Refresh the RSC tree so server components re-read the (now-absent)
      // cookies, then hard-navigate to home to clear any client state.
      router.refresh();
      router.push('/');
      setLoggingOut(false);
    }
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-on-surface-muted hover:text-gold transition-colors duration-200"
        style={{
          ...AUTH_LINK_BASE,
          border: '1px solid #4d4637',
          padding: '11px 20px',
        }}
      >
        Login
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Profile link — greeting with first name */}
      <Link
        href="/profile"
        className="text-on-surface-muted hover:text-gold transition-colors duration-200"
        style={{
          ...AUTH_LINK_BASE,
          gap: '8px',
        }}
        title={`${user.first_name} ${user.last_name}`}
      >
        {/* Small avatar circle */}
        <span
          style={{
            width: '26px',
            height: '26px',
            backgroundColor: 'rgba(201,168,76,0.12)',
            border: '1px solid #C9A84C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#C9A84C',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {user.first_name.charAt(0).toUpperCase()}
        </span>
        <span style={{ color: '#d0c5b2' }}>{user.first_name}</span>
      </Link>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        style={{
          ...AUTH_LINK_BASE,
          border: '1px solid #4d4637',
          padding: '11px 16px',
          backgroundColor: 'transparent',
          cursor: loggingOut ? 'not-allowed' : 'pointer',
          color: loggingOut ? '#4d4637' : '#99907e',
          transition: 'color 0.15s, border-color 0.15s',
        }}
        aria-label="Log out"
      >
        {loggingOut ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ animation: 'spin 0.8s linear infinite' }} aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="10 8" strokeLinecap="round" />
          </svg>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '6px' }} aria-hidden="true">
              <path d="M5 2H2v8h3M8 4l3 2-3 2M11 6H5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Logout
          </>
        )}
      </button>
    </div>
  );
}
