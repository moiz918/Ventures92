'use client';

import Link from 'next/link';
import { useState } from 'react';

import { ApiError } from '@/services/api';
import { forgotPassword } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setErrorMsg('Please enter a valid email.');
      } else {
        setErrorMsg('Could not start password reset right now. Please try again.');
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
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
          Account Recovery
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: '26px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#e9e1d7',
            margin: '0 0 12px',
            lineHeight: 1.15,
          }}
        >
          Forgot Password
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '13px',
            color: '#99907e',
            margin: '0 0 28px',
            lineHeight: 1.6,
          }}
        >
          Enter the email associated with your account and we&apos;ll send a
          link to reset your password. The link expires in 30 minutes.
        </p>

        {submitted ? (
          <div
            style={{
              border: '1px solid rgba(201,168,76,0.3)',
              padding: '20px',
              backgroundColor: 'rgba(201,168,76,0.05)',
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '13px',
                color: '#d0c5b2',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              If <strong style={{ color: '#C9A84C' }}>{email}</strong> is registered, a
              password-reset link has been sent. Check your inbox (and spam folder).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  backgroundColor: '#100e08',
                  border: `1px solid ${focused ? '#C9A84C' : '#4d4637'}`,
                  color: '#e9e1d7',
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '14px',
                  padding: '13px 14px',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
              />
            </div>

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
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? '#7a6a2e' : '#C9A84C',
                color: '#1A1A1A',
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '15px 24px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Sending Link…' : 'Send Reset Link'}
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
