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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#C9A84C">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    label: 'WhatsApp',
    value: '+92 303 964 0744',
    href: 'https://wa.me/923039640744',
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

            {/* WhatsApp CTA button */}
            <a
              href="https://wa.me/923039640744"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid #C9A84C',
                color: '#C9A84C',
                backgroundColor: 'transparent',
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '14px 24px',
                textDecoration: 'none',
                alignSelf: 'flex-start',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>

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
