'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[App error boundary]', error);
    }
  }, [error]);

  return (
    <div
      style={{
        backgroundColor: '#16130d',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingInline: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#1e1b15',
          border: '1px solid #4d4637',
          borderTop: '3px solid #C9A84C',
          padding: '48px 40px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            display: 'block',
            marginBottom: '14px',
          }}
        >
          Unexpected Error
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#e9e1d7',
            margin: '0 0 12px',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '14px',
            color: '#99907e',
            lineHeight: 1.65,
            margin: '0 0 32px',
          }}
        >
          We hit a snag rendering this page. Try again, or head back to safety.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              backgroundColor: '#C9A84C',
              border: 'none',
              padding: '13px 26px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              border: '1px solid #C9A84C',
              padding: '13px 26px',
              textDecoration: 'none',
            }}
          >
            Back to Home
          </Link>
        </div>

        {error.digest && (
          <p
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: '10px',
              color: '#4d4637',
              marginTop: '24px',
              letterSpacing: '0.04em',
            }}
          >
            ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
