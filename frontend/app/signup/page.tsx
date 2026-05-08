'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signup, type PublicSignupRole } from '@/services/authService';
import { ApiError } from '@/services/api';

// ---- Styles -----------------------------------------------------------------
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

// ---- Component --------------------------------------------------------------
export default function SignUpPage() {
  const router = useRouter();

  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [email,        setEmail]        = useState('');
  const [phone,        setPhone]        = useState('');
  const [password,     setPassword]     = useState('');
  const [role,         setRole]         = useState<PublicSignupRole>('BUYER_TENANT');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed,       setAgreed]       = useState(false);
  const [focused,      setFocused]      = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const isFocused = (name: string) => focused === name;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signup({
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        email:      email.trim(),
        password,
        phone_number: phone.trim() || undefined,
        role,
      });
      // Cookies are set by the backend -- redirect based on role
      router.push(role === 'INVESTOR' || role === 'BUYER_TENANT' ? '/' : '/admin/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError('An account with this email already exists. Try logging in instead.');
        } else if (err.status === 422) {
          setError(err.message || 'Please check your details -- some fields are invalid.');
        } else {
          setError(err.message || 'Registration failed. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
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

      {/* Left panel -- brand (hidden on mobile) */}
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
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0, bottom: 0, right: 0,
            width: '1px',
            background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.2) 30%, rgba(201,168,76,0.2) 70%, transparent)',
          }}
        />
        <div>
          <span style={{ fontFamily: 'var(--font-epilogue)', fontSize: '13px', fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A84C' }}>
            Ventures 92
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '440px' }}>
          <div aria-hidden style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C', opacity: 0.6 }} />
          <h2 style={{ fontFamily: 'var(--font-epilogue)', fontSize: 'clamp(32px, 3vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', textTransform: 'uppercase', color: '#e9e1d7', lineHeight: 1.05, margin: 0 }}>
            Join Pakistan&apos;s<br />
            <span style={{ color: '#C9A84C' }}>Premier</span><br />
            Real Estate Portal
          </h2>
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '14px', lineHeight: 1.75, color: '#99907e', margin: 0, maxWidth: '360px' }}>
            Get access to verified listings, curated portfolios, and dedicated agents.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {['Curated shortlist within 24 hours', 'Verified properties, zero surprises', 'Direct developer access, no middlemen'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '5px', height: '5px', backgroundColor: '#C9A84C', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', color: '#99907e', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L2 4v4c0 2.485 2.1 4.81 5 5.5 2.9-.69 5-3.015 5-5.5V4L7 1.5z" stroke="#C9A84C" strokeWidth="1.25" strokeLinejoin="round" /></svg>
          <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#4d4637', textTransform: 'uppercase' }}>
            Secure Registration · Data Encrypted
          </span>
        </div>
      </div>

      {/* Right panel -- form */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 40px',
          backgroundColor: '#16130d',
          overflowY: 'auto',
        }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden" style={{ marginBottom: '40px' }}>
          <span style={{ fontFamily: 'var(--font-epilogue)', fontSize: '13px', fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A84C' }}>Ventures 92</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', display: 'block', marginBottom: '12px' }}>
            Get Started
          </span>
          <h1 style={{ fontFamily: 'var(--font-epilogue)', fontSize: '30px', fontWeight: 700, letterSpacing: '-0.02em', textTransform: 'uppercase', color: '#e9e1d7', margin: '0 0 10px', lineHeight: 1.1 }}>
            Create Account
          </h1>
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '14px', color: '#99907e', margin: 0, lineHeight: 1.6 }}>
            Join and find your perfect property today.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: '20px', opacity: isSubmitting ? 0.65 : 1, transition: 'opacity 0.2s' }}
        >
          {/* Error banner */}
          {error && (
            <div style={{ border: '1px solid #4d4637', borderLeft: '3px solid #C9A84C', backgroundColor: '#1e1b15', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="8" cy="8" r="7" stroke="#99907e" strokeWidth="1.25" />
                <path d="M8 5v4M8 11v.5" stroke="#99907e" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', color: '#d0c5b2', margin: 0, lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={LABEL}>First Name</label>
              <input type="text" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} onFocus={() => setFocused('first_name')} onBlur={() => setFocused(null)} placeholder="Ahmad" style={inputStyle(isFocused('first_name'))} />
            </div>
            <div>
              <label style={LABEL}>Last Name</label>
              <input type="text" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} onFocus={() => setFocused('last_name')} onBlur={() => setFocused(null)} placeholder="Khan" style={inputStyle(isFocused('last_name'))} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={LABEL}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isFocused('email') ? '#C9A84C' : '#4d4637', transition: 'color 0.15s', pointerEvents: 'none', display: 'flex' }}>
                <MailIcon />
              </span>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="ahmad@example.com" style={{ ...inputStyle(isFocused('email')), paddingLeft: '42px' }} />
            </div>
          </div>

          {/* Phone (optional) */}
          <div>
            <label style={LABEL}>Phone Number <span style={{ color: '#4d4637', fontWeight: 400 }}>(optional)</span></label>
            <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} placeholder="+92 300 0000000" style={inputStyle(isFocused('phone'))} />
          </div>

          {/* Role selector */}
          <div>
            <label style={LABEL}>Account Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {([
                { value: 'BUYER_TENANT' as PublicSignupRole, label: 'Buyer / Tenant', desc: 'Looking to buy or rent' },
                { value: 'INVESTOR'     as PublicSignupRole, label: 'Investor',        desc: 'Portfolio & investment' },
              ] as const).map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  style={{
                    padding: '14px 12px',
                    border: `1px solid ${role === value ? '#C9A84C' : '#4d4637'}`,
                    backgroundColor: role === value ? 'rgba(201,168,76,0.08)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s, background-color 0.15s',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: role === value ? '#C9A84C' : '#d0c5b2', margin: '0 0 3px', transition: 'color 0.15s' }}>{label}</p>
                  <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '11px', color: '#4d4637', margin: 0 }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={LABEL}>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: isFocused('password') ? '#C9A84C' : '#4d4637', transition: 'color 0.15s', pointerEvents: 'none', display: 'flex' }}>
                <LockIcon />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="Min. 10 characters"
                style={{ ...inputStyle(isFocused('password')), paddingLeft: '42px', paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4d4637', padding: '4px', display: 'flex' }}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '11px', color: '#4d4637', margin: '6px 0 0' }}>
              Min. 10 chars, including uppercase, lowercase, number, and special character.
            </p>
          </div>

          {/* Terms */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', paddingTop: '4px' }}>
            <div style={{ position: 'relative', flexShrink: 0, marginTop: '1px' }}>
              <input
                type="checkbox"
                required
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ appearance: 'none', width: '16px', height: '16px', border: `1px solid ${agreed ? '#C9A84C' : '#4d4637'}`, backgroundColor: agreed ? 'rgba(201,168,76,0.15)' : '#100e08', cursor: 'pointer', transition: 'border-color 0.15s, background-color 0.15s', display: 'block' }}
              />
              {agreed && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '12px', color: '#99907e', lineHeight: 1.6 }}>
              I agree to the{' '}
              <Link href="#" style={{ color: '#C9A84C', textDecoration: 'none' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" style={{ color: '#C9A84C', textDecoration: 'none' }}>Privacy Policy</Link>
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: isSubmitting ? '#7a6a2e' : '#C9A84C', color: '#1A1A1A', fontFamily: 'var(--font-manrope)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '16px 24px', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background-color 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', marginTop: '4px' }}
          >
            {isSubmitting ? (
              <><SpinnerIcon />Creating Account...</>
            ) : (
              <>Create Account <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></>
            )}
          </button>
        </form>

        {/* Login link */}
        <div style={{ marginTop: '32px', paddingTop: '28px', borderTop: '1px solid #2d2a23', textAlign: 'center' }}>
          <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', color: '#99907e' }}>Already have an account? </span>
          <Link href="/login" style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', fontWeight: 700, color: '#C9A84C', textDecoration: 'none', letterSpacing: '0.04em' }}>Log in</Link>
        </div>

        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2d2a23', textAlign: 'center', marginTop: '32px' }}>
          Secure Registration · Data Encrypted
        </p>
      </div>
    </div>
  );
}

// ---- Icons ------------------------------------------------------------------
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
