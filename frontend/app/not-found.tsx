import Link from 'next/link';

export default function NotFound() {
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
          padding: '56px 40px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '64px',
            fontWeight: 700,
            color: '#C9A84C',
            letterSpacing: '-0.04em',
            margin: '0 0 8px',
            lineHeight: 1,
          }}
        >
          404
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: '#e9e1d7',
            margin: '0 0 12px',
          }}
        >
          Page Not Found
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
          The page you&apos;re looking for has moved or no longer exists.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              backgroundColor: '#C9A84C',
              padding: '13px 26px',
              textDecoration: 'none',
            }}
          >
            Back to Home
          </Link>
          <Link
            href="/properties"
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
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
