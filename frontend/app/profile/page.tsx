import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your Ventures 92 account',
};

// Role display labels
const ROLE_LABELS: Record<string, string> = {
  INVESTOR:     'Investor',
  BUYER_TENANT: 'Buyer / Tenant',
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ProfilePage() {
  const user = await getCurrentUser();

  // Guard: not authenticated → login
  if (!user) {
    redirect('/login');
  }

  // Guard: admin / agent roles belong in /admin/dashboard, not the public profile
  if (user.role === 'SUPER_ADMIN' || user.role === 'AGENT') {
    redirect('/login');
  }

  const roleLabel = ROLE_LABELS[user.role] ?? user.role;
  const initials  = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#16130d',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Architectural grid overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), ' +
            'linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          pointerEvents: 'none',
        }}
      />

      {/* Gold left-edge accent */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.4) 20%, rgba(201,168,76,0.4) 80%, transparent)',
        }}
      />

      <div
        className="mx-auto"
        style={{
          maxWidth: '1100px',
          paddingInline: 'var(--spacing-margin)',
          paddingBlock: '64px',
          position: 'relative',
        }}
      >
        {/* Page eyebrow + heading */}
        <div style={{ marginBottom: '48px' }}>
          <span
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            My Account
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: '#e9e1d7',
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            Profile
          </h1>
        </div>

        {/* Two-column layout on desktop */}
        <div
          className="grid gap-8 lg:grid-cols-[320px_1fr]"
          style={{ alignItems: 'start' }}
        >

          {/* ── Left: Avatar + role card ─────────────────────────── */}
          <div
            style={{
              backgroundColor: '#1e1b15',
              border: '1px solid #4d4637',
            }}
          >
            {/* Gold accent top bar */}
            <div style={{ height: '3px', backgroundColor: '#C9A84C' }} />

            <div
              style={{
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                textAlign: 'center',
              }}
            >
              {/* Initials avatar */}
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-epilogue)',
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#C9A84C',
                    letterSpacing: '0.05em',
                  }}
                >
                  {initials}
                </span>
              </div>

              {/* Name */}
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-epilogue)',
                    fontSize: '18px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: '#e9e1d7',
                    margin: '0 0 6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {user.first_name} {user.last_name}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    border: '1px solid rgba(201,168,76,0.4)',
                    padding: '4px 12px',
                  }}
                >
                  {roleLabel}
                </span>
              </div>

              {/* Divider */}
              <div style={{ width: '100%', height: '1px', backgroundColor: '#4d4637' }} />

              {/* Account status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '7px',
                    height: '7px',
                    backgroundColor: user.is_active ? '#1D9E75' : '#8B2E2E',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: user.is_active ? '#1D9E75' : '#8B2E2E',
                  }}
                >
                  {user.is_active ? 'Active Account' : 'Account Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Details + actions ─────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Profile details card */}
            <div
              style={{
                backgroundColor: '#1e1b15',
                border: '1px solid #4d4637',
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #4d4637',
                  backgroundColor: '#100e08',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    margin: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Account Details
                </p>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#4d4637' }} />
              </div>

              {/* Field rows */}
              <div style={{ padding: '8px 0' }}>
                <ProfileRow label="First Name"  value={user.first_name} />
                <ProfileRow label="Last Name"   value={user.last_name}  />
                <ProfileRow label="Email"       value={user.email}      />
                <ProfileRow label="Account Type" value={roleLabel}      isLast />
              </div>
            </div>

            {/* Change password card (UI scaffold — no logic yet) */}
            <div
              style={{
                backgroundColor: '#1e1b15',
                border: '1px solid #4d4637',
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid #4d4637',
                  backgroundColor: '#100e08',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    margin: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Security
                </p>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#4d4637' }} />
              </div>

              <div style={{ padding: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--font-manrope)',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#d0c5b2',
                        margin: '0 0 4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Password
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-manrope)',
                        fontSize: '12px',
                        color: '#4d4637',
                        margin: 0,
                      }}
                    >
                      Last updated: not tracked
                    </p>
                  </div>
                  {/* Placeholder — change password link (page not yet built) */}
                  <Link
                    href="#"
                    aria-disabled
                    style={{
                      fontFamily: 'var(--font-manrope)',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#4d4637',
                      border: '1px solid #4d4637',
                      padding: '10px 20px',
                      textDecoration: 'none',
                      cursor: 'not-allowed',
                      display: 'inline-block',
                    }}
                    tabIndex={-1}
                  >
                    Change Password
                  </Link>
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '11px',
                    color: '#4d4637',
                    margin: '16px 0 0',
                    fontStyle: 'italic',
                  }}
                >
                  Password change functionality coming soon.
                </p>
              </div>
            </div>

            {/* Back to listings */}
            <div style={{ paddingTop: '8px' }}>
              <Link
                href="/properties"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#4d4637',
                  textDecoration: 'none',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M9 6H3M5 3L2 6l3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────
function ProfileRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: '12px',
        alignItems: 'center',
        padding: '14px 24px',
        borderBottom: isLast ? 'none' : '1px solid #4d4637',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4d4637',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '14px',
          color: '#e9e1d7',
        }}
      >
        {value}
      </span>
    </div>
  );
}
