import type { Metadata } from 'next';
import LeadCaptureForm from '@/components/LeadCaptureForm';

export const metadata: Metadata = {
  title: 'Find Your Property — Ventures 92',
  description:
    'Submit your requirements and our team will deliver a curated shortlist within 24 hours.',
};

// ── Trust signal data ─────────────────────────────────────────────────────────
const TRUST = [
  { value: '24h',  label: 'Response Time' },
  { value: '100+', label: 'Properties Listed' },
  { value: '6+',   label: 'Prime Locations' },
  { value: '10+',  label: 'Years Experience' },
] as const;

const CONTACT_ITEMS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 3.5C2 2.95 2.45 2.5 3 2.5h2.5l1 3-1.5 1a9 9 0 004.5 4.5l1-1.5 3 1v2.5c0 .55-.45 1-1 1C6.72 13.5 2 8.78 2 3.5z" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Phone',
    value: '+92 303 964 0744',
    href: 'tel:+923039640744',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3.5" width="12" height="9" rx="0.5" stroke="#C9A84C" strokeWidth="1.25" />
        <path d="M2 5l6 4 6-4" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
    label: 'Email',
    value: 'info@ventures92.com',
    href: 'mailto:info@ventures92.com',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5C5.24 1.5 3 3.74 3 6.5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="#C9A84C" strokeWidth="1.25" />
        <circle cx="8" cy="6.5" r="1.5" stroke="#C9A84C" strokeWidth="1.25" />
      </svg>
    ),
    label: 'Office',
    value: 'DHA Phase 6, Lahore',
    href: undefined,
  },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  return (
    <div style={{ backgroundColor: '#16130d', minHeight: '100vh' }}>

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div style={{ backgroundColor: '#1e1b15', borderBottom: '1px solid #4d4637' }}>
        <div
          className="mx-auto"
          style={{ maxWidth: '1600px', paddingInline: '64px', paddingBlock: '40px' }}
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
              marginBottom: '10px',
            }}
          >
            Property Matchmaking
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: 'clamp(28px, 3vw, 48px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: '#e9e1d7',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Let Us Find Your<br />
            <span style={{ color: '#C9A84C' }}>Perfect Property</span>
          </h1>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div
        className="mx-auto"
        style={{ maxWidth: '1600px', paddingInline: '64px', paddingBlock: '64px' }}
      >
        <div
          className="grid gap-16 lg:grid-cols-[1fr_560px]"
          style={{ alignItems: 'start' }}
        >

          {/* ── Left: copy + trust signals + contact ─────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

            {/* Main copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '16px',
                  lineHeight: 1.8,
                  color: '#d0c5b2',
                  margin: 0,
                  maxWidth: '520px',
                }}
              >
                Share your exact requirements and our specialists will curate a
                personalised shortlist from our verified portfolio within{' '}
                <span style={{ color: '#C9A84C', fontWeight: 600 }}>24 hours</span> —
                no unsolicited calls, no pressure.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '15px',
                  lineHeight: 1.75,
                  color: '#99907e',
                  margin: 0,
                  maxWidth: '480px',
                }}
              >
                Whether you are seeking a family residence in DHA, a commercial
                unit in Gulberg, or a high-yield investment plot — we bring the
                market to you.
              </p>
            </div>

            {/* Trust grid */}
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#4d4637',
                  marginBottom: '20px',
                }}
              >
                Why Ventures 92
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1px',
                  backgroundColor: '#4d4637',
                  border: '1px solid #4d4637',
                  maxWidth: '400px',
                }}
              >
                {TRUST.map((t) => (
                  <div
                    key={t.label}
                    style={{
                      backgroundColor: '#1e1b15',
                      padding: '24px 28px',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-space-grotesk)',
                        fontSize: '32px',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: '#C9A84C',
                        margin: '0 0 4px',
                        lineHeight: 1,
                      }}
                    >
                      {t.value}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-manrope)',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#99907e',
                        margin: 0,
                      }}
                    >
                      {t.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#4d4637',
                  margin: 0,
                }}
              >
                Direct Contact
              </p>

              {CONTACT_ITEMS.map((item) =>
                item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      textDecoration: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        border: '1px solid #4d4637',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-manrope)',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#4d4637',
                          margin: '0 0 2px',
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-manrope)',
                          fontSize: '14px',
                          color: '#d0c5b2',
                          margin: 0,
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  </a>
                ) : (
                  <div
                    key={item.label}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        border: '1px solid #4d4637',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-manrope)',
                          fontSize: '10px',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: '#4d4637',
                          margin: '0 0 2px',
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-manrope)',
                          fontSize: '14px',
                          color: '#d0c5b2',
                          margin: 0,
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Decorative accent line */}
            <div
              aria-hidden
              style={{
                width: '1px',
                height: '80px',
                background: 'linear-gradient(to bottom, #C9A84C, transparent)',
                opacity: 0.4,
              }}
            />
          </div>

          {/* ── Right: form ──────────────────────────────────────────── */}
          <div style={{ position: 'sticky', top: '88px' }}>
            <LeadCaptureForm />
          </div>
        </div>
      </div>
    </div>
  );
}
