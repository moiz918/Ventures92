'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { ApiError } from '@/services/api';
import { isAdminRole, login } from '@/services/authService';

// ── Shared auth input style factory ──────────────────────────────────────────
function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%',
    backgroundColor: '#100e08',
    border: `1px solid ${focused ? '#C9A84C' : '#4d4637'}`,
    color: '#e9e1d7',
    fontFamily: 'var(--font-manrope)',
    fontSize: '14px',
    padding: '13px 14px',
    outline: 'none',
    transition: 'border-color 0.15s',
    display: 'block',
  };
}

const LABEL: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-manrope)',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#99907e',
  marginBottom: '8px',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/admin/dashboard';
  const sessionExpired = searchParams.get('expired') === '1';

  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [focused,       setFocused]       = useState<string | null>(null);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [errorMsg,      setErrorMsg]      = useState<string | null>(
    sessionExpired ? 'Your session expired. Please sign in again.' : null,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const { user } = await login({ email: email.trim(), password });
      if (!isAdminRole(user.role)) {
        setErrorMsg('This account does not have admin access.');
        setIsSubmitting(false);
        return;
      }
      // The backend has already set HttpOnly cookies on the response.
      // Use a hard navigation so RSC/middleware see the new cookies.
      const safeNext = nextPath.startsWith('/') ? nextPath : '/admin/dashboard';
      window.location.assign(safeNext);
    } catch (err) {
      setIsSubmitting(false);
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setErrorMsg('Invalid email or password.');
        } else if (err.status === 403) {
          setErrorMsg(err.message || 'Account disabled. Please contact an administrator.');
        } else if (err.status === 423) {
          setErrorMsg(
            err.message ||
              'Account temporarily locked after too many failed attempts. Try again later.',
          );
        } else if (err.status === 422) {
          setErrorMsg('Please double-check the email format.');
        } else {
          setErrorMsg('We could not sign you in right now. Please try again.');
        }
      } else {
        setErrorMsg('Network error — please check your connection and try again.');
      }
    }
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#100e08',
        display: 'flex',
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
          backgroundImage: `
            linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
          pointerEvents: 'none',
        }}
      />

      {/* ── Left panel — brand (hidden on mobile) ──────────────────── */}
      <div
        className="hidden lg:flex"
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: `
            radial-gradient(ellipse 70% 60% at 30% 50%, rgba(201,168,76,0.06) 0%, transparent 100%),
            linear-gradient(135deg, #16130d 0%, #100e08 100%)
          `,
          borderRight: '1px solid #2d2a23',
          position: 'relative',
        }}
      >
        {/* Gold vertical accent */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: '1px',
            background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.2) 30%, rgba(201,168,76,0.2) 70%, transparent)',
          }}
        />

        {/* Logo block */}
        <div>
          <span
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#C9A84C',
            }}
          >
            Ventures 92
          </span>
        </div>

        {/* Centre copy */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '440px' }}>
          <div
            aria-hidden
            style={{
              width: '40px',
              height: '1px',
              backgroundColor: '#C9A84C',
              opacity: 0.6,
            }}
          />
          <h2
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: 'clamp(32px, 3vw, 52px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: '#e9e1d7',
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            Heritage-Grade
            <br />
            <span style={{ color: '#C9A84C' }}>Real Estate</span>
            <br />
            Excellence
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '14px',
              lineHeight: 1.75,
              color: '#99907e',
              margin: 0,
              maxWidth: '360px',
            }}
          >
            Access your portal to Pakistan's most exclusive verified
            real estate portfolio.
          </p>
        </div>

        {/* Bottom trust line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5L2 4v4c0 2.485 2.1 4.81 5 5.5 2.9-.69 5-3.015 5-5.5V4L7 1.5z" stroke="#C9A84C" strokeWidth="1.25" strokeLinejoin="round" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              color: '#4d4637',
              textTransform: 'uppercase',
            }}
          >
            Secure Authentication · Data Encrypted
          </span>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────── */}
      <div
        className="login-right-panel lg:max-w-[520px]"
        style={{
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#16130d',
          borderLeft: '1px solid #2d2a23',
        }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden" style={{ marginBottom: '40px' }}>
          <span
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#C9A84C',
            }}
          >
            Ventures 92
          </span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
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
            Agent Access
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: '30px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: '#e9e1d7',
              margin: '0 0 10px',
              lineHeight: 1.1,
            }}
          >
            Sign In
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '14px',
              color: '#99907e',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Enter your credentials to access the portal.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            opacity: isSubmitting ? 0.65 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {/* Email */}
          <div>
            <label style={LABEL}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focused === 'email' ? '#C9A84C' : '#4d4637',
                  transition: 'color 0.15s',
                  pointerEvents: 'none',
                  display: 'flex',
                }}
              >
                <MailIcon />
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                style={{ ...inputStyle(focused === 'email'), paddingLeft: '42px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <label style={{ ...LABEL, marginBottom: 0 }}>Password</label>
              <Link
                href="/forgot-password"
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#C9A84C',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  opacity: 0.8,
                }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: focused === 'password' ? '#C9A84C' : '#4d4637',
                  transition: 'color 0.15s',
                  pointerEvents: 'none',
                  display: 'flex',
                }}
              >
                <LockIcon />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                style={{
                  ...inputStyle(focused === 'password'),
                  paddingLeft: '42px',
                  paddingRight: '44px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#4d4637',
                  padding: '4px',
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div
              style={{
                backgroundColor: 'rgba(201,168,76,0.08)',
                border: '1px solid rgba(201,168,76,0.3)',
                padding: '11px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="6" stroke="#C9A84C" strokeWidth="1.25" />
                <line x1="7" y1="4.5" x2="7" y2="8" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" />
                <circle cx="7" cy="10" r="0.75" fill="#C9A84C" />
              </svg>
              <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', color: '#d0c5b2' }}>
                {errorMsg}
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#7a6a2e' : '#C9A84C',
              color: '#1A1A1A',
              fontFamily: 'var(--font-manrope)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '16px 24px',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              marginTop: '4px',
            }}
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon />
                Signing In…
              </>
            ) : (
              <>
                Sign In
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginTop: '32px',
            marginBottom: '28px',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: '#2d2a23' }} />
          <span
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#4d4637',
            }}
          >
            New to Ventures 92?
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#2d2a23' }} />
        </div>

        {/* Sign-up link */}
        <Link
          href="/signup"
          style={{
            display: 'block',
            textAlign: 'center',
            fontFamily: 'var(--font-manrope)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            border: '1px solid #4d4637',
            padding: '14px 24px',
            textDecoration: 'none',
            transition: 'border-color 0.15s',
          }}
        >
          Create an Account
        </Link>

        {/* Security footer */}
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#2d2a23',
            textAlign: 'center',
            marginTop: '40px',
          }}
        >
          Secure Authentication · Data Encrypted
        </p>
      </div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3.5" width="12" height="9" stroke="currentColor" strokeWidth="1.25" />
      <path d="M2 5.5l6 4 6-4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3.5" y="7" width="9" height="7" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="8" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 8C1.5 8 4 3.5 8 3.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 8C1.5 8 4 3.5 8 3.5S14.5 8 14.5 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M11.5 10.5A4.5 4.5 0 014.5 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 14" strokeLinecap="round" />
    </svg>
  );
}
