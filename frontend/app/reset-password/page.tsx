'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { ApiError } from '@/services/api';
import { resetPassword } from '@/services/authService';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    !token ? 'Invalid or missing reset link. Please request a new one.' : null,
  );
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    if (password.length < 10) {
      setErrorMsg('Password must be at least 10 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.replace('/login'), 1800);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || 'Could not reset your password.');
      } else {
        setErrorMsg('Network error — please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function fieldStyle(name: string): React.CSSProperties {
    return {
      width: '100%',
      backgroundColor: '#100e08',
      border: `1px solid ${focused === name ? '#C9A84C' : '#4d4637'}`,
      color: '#e9e1d7',
      fontFamily: 'var(--font-manrope)',
      fontSize: '14px',
      padding: '13px 14px',
      outline: 'none',
      transition: 'border-color 0.15s',
    };
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: '#100e08',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#16130d',
          border: '1px solid #2d2a23',
          padding: '40px 32px',
        }}
      >
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
          Set New Password
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#e9e1d7',
            margin: '0 0 24px',
            lineHeight: 1.15,
          }}
        >
          Reset Your Password
        </h1>

        {done ? (
          <div
            style={{
              border: '1px solid rgba(29,158,117,0.4)',
              backgroundColor: 'rgba(29,158,117,0.06)',
              padding: '20px',
              fontFamily: 'var(--font-manrope)',
              fontSize: '13px',
              color: '#d0c5b2',
              lineHeight: 1.6,
            }}
          >
            Password updated. Redirecting to sign-in…
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#99907e',
                  marginBottom: '8px',
                }}
              >
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={10}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                style={fieldStyle('password')}
                disabled={!token}
              />
              <p
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '11px',
                  color: '#4d4637',
                  margin: '6px 0 0',
                }}
              >
                At least 10 characters.
              </p>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#99907e',
                  marginBottom: '8px',
                }}
              >
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused(null)}
                style={fieldStyle('confirm')}
                disabled={!token}
              />
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                color: '#99907e',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show passwords
            </label>

            {errorMsg && (
              <div
                style={{
                  border: '1px solid rgba(255,68,68,0.4)',
                  backgroundColor: 'rgba(255,68,68,0.06)',
                  padding: '11px 14px',
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '13px',
                  color: '#e9e1d7',
                }}
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !token}
              style={{
                backgroundColor: isSubmitting || !token ? '#7a6a2e' : '#C9A84C',
                color: '#1A1A1A',
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '15px 24px',
                border: 'none',
                cursor: isSubmitting || !token ? 'not-allowed' : 'pointer',
                marginTop: '4px',
              }}
            >
              {isSubmitting ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}

        <div
          style={{
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid #2d2a23',
            textAlign: 'center',
          }}
        >
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              textDecoration: 'none',
            }}
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
