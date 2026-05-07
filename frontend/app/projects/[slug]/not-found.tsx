import Link from 'next/link';

export default function ProjectNotFound() {
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
        <span
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            display: 'block',
            marginBottom: '14px',
          }}
        >
          Development Unavailable
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
          We couldn&apos;t find that development
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
          The project may have been delisted or the URL is mistyped. Explore
          our portfolio of current developments below.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/projects"
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
            All Developments
          </Link>
          <Link
            href="/contact"
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
            Talk to an Agent
          </Link>
        </div>
      </div>
    </div>
  );
}
