import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Our Vision',
  description:
    "Ventures 92 is Pakistan's premier destination for architecturally distinguished residential and commercial real estate — built on direct developer relationships and decades of trusted execution.",
};

// ── Pillars ───────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    eyebrow: '01',
    title: 'Direct From The Developer',
    body: 'Every listing is sourced through verified developer partnerships. No hearsay, no inflated brokerage layers — only direct access to the principal.',
  },
  {
    eyebrow: '02',
    title: 'Architectural Discernment',
    body: 'We curate buildings that endure — designed with proportion, material honesty, and timeless detail. Our portfolio is selective by intent.',
  },
  {
    eyebrow: '03',
    title: 'Discretion By Default',
    body: 'No spam pipelines. No drip campaigns. Every enquiry is handled by a senior specialist who actually returns your call within the same business day.',
  },
] as const;

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '10+',  label: 'Years Operating'   },
  { value: '6+',   label: 'Prime Locations'   },
  { value: '100+', label: 'Verified Listings' },
  { value: '24h',  label: 'Response Standard' },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div style={{ backgroundColor: '#16130d', minHeight: '100vh' }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          backgroundColor: '#1e1b15',
          borderBottom: '1px solid #4d4637',
          overflow: 'hidden',
        }}
      >
        {/* Architectural grid overlay */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        {/* Gold accent — left edge */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            background: 'linear-gradient(to bottom, transparent 0%, #C9A84C 40%, transparent 100%)',
            opacity: 0.5,
          }}
        />
        {/* Soft radial glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 60% at 80% 50%, rgba(201,168,76,0.07) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="mx-auto"
          style={{
            maxWidth: '1600px',
            paddingInline: '64px',
            paddingBlock: '96px',
            position: 'relative',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              display: 'block',
              marginBottom: '18px',
            }}
          >
            About Ventures 92
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: 'clamp(40px, 5vw, 72px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
              color: '#e9e1d7',
              lineHeight: 1.0,
              margin: '0 0 24px',
              maxWidth: '900px',
            }}
          >
            Our<br />
            <span style={{ color: '#C9A84C' }}>Vision</span>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '17px',
              lineHeight: 1.75,
              color: '#d0c5b2',
              margin: 0,
              maxWidth: '640px',
            }}
          >
            We exist for the client who refuses to compromise — who wants
            real estate sourced with the same precision an architect brings to
            a load-bearing wall. Ventures 92 is built to be that quiet,
            uncompromising standard for Pakistan&apos;s most exacting buyers.
          </p>
        </div>
      </section>

      {/* ── Stat strip ───────────────────────────────────────────── */}
      <section
        style={{
          display: 'flex',
          gap: '1px',
          backgroundColor: '#4d4637',
          borderBottom: '1px solid #4d4637',
        }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1,
              backgroundColor: '#1e1b15',
              padding: '24px 28px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: '32px',
                fontWeight: 700,
                color: '#C9A84C',
                margin: '0 0 4px',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {s.value}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#99907e',
                margin: 0,
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* ── Narrative section ────────────────────────────────────── */}
      <section
        className="mx-auto"
        style={{
          maxWidth: '1600px',
          paddingInline: '64px',
          paddingBlock: '96px',
        }}
      >
        <div
          className="grid gap-16 lg:grid-cols-[280px_1fr]"
          style={{ alignItems: 'start' }}
        >
          {/* Eyebrow column */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                margin: '0 0 14px',
              }}
            >
              The Practice
            </p>
            <div
              aria-hidden
              style={{
                width: '40px',
                height: '2px',
                backgroundColor: '#C9A84C',
                marginBottom: '4px',
              }}
            />
          </div>

          {/* Body column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '780px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-epilogue)',
                fontSize: 'clamp(28px, 3.2vw, 44px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                color: '#e9e1d7',
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              Real estate, treated with the seriousness of architecture.
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '16px',
                lineHeight: 1.85,
                color: '#d0c5b2',
                margin: 0,
              }}
            >
              Ventures 92 was founded to serve a specific kind of client —
              one who has already been disappointed by the standard market.
              The agents who don&apos;t answer. The listings that aren&apos;t real.
              The buildings that look better in the brochure than in person.
              We treat every relationship as long-form: most of our portfolio
              comes from referrals, and most of our buyers return.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '16px',
                lineHeight: 1.85,
                color: '#99907e',
                margin: 0,
              }}
            >
              We work directly with the developers behind Pakistan&apos;s most
              architecturally ambitious projects — DHA, Bahria, Gulberg, and
              the emerging high-design corridors of Lahore and Islamabad. Our
              specialists are licensed practitioners, not commission chasers.
              Every shortlist we deliver is hand-selected against a written
              brief — not pulled from a public database.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pillars ──────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: '#1e1b15',
          borderTop: '1px solid #4d4637',
          borderBottom: '1px solid #4d4637',
        }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: '1600px',
            paddingInline: '64px',
            paddingBlock: '96px',
          }}
        >
          <SectionEyebrow>What We Stand For</SectionEyebrow>

          <div
            className="grid gap-px mt-12"
            style={{
              backgroundColor: '#4d4637',
              border: '1px solid #4d4637',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            }}
          >
            {PILLARS.map((p) => (
              <div
                key={p.title}
                style={{
                  backgroundColor: '#16130d',
                  padding: '40px 36px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  minHeight: '240px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#C9A84C',
                    letterSpacing: '0.08em',
                  }}
                >
                  {p.eyebrow}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-epilogue)',
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase',
                    color: '#e9e1d7',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '14px',
                    lineHeight: 1.75,
                    color: '#99907e',
                    margin: 0,
                  }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────── */}
      <section
        className="mx-auto"
        style={{
          maxWidth: '1600px',
          paddingInline: '64px',
          paddingBlock: '96px',
          textAlign: 'center',
        }}
      >
        <SectionEyebrow center>Begin a Conversation</SectionEyebrow>
        <h2
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: 'clamp(28px, 3vw, 40px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#e9e1d7',
            margin: '20px 0 16px',
            lineHeight: 1.1,
          }}
        >
          Tell us what you&apos;re looking for.
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '15px',
            lineHeight: 1.75,
            color: '#99907e',
            margin: '0 auto 36px',
            maxWidth: '520px',
          }}
        >
          A senior specialist will reach out within the same business day with a
          curated shortlist matched to your exact brief.
        </p>
        <div
          style={{
            display: 'inline-flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#C9A84C',
              color: '#1A1A1A',
              fontFamily: 'var(--font-manrope)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '14px 28px',
              textDecoration: 'none',
            }}
          >
            Begin Enquiry
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/properties"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid #C9A84C',
              color: '#C9A84C',
              backgroundColor: 'transparent',
              fontFamily: 'var(--font-manrope)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '13px 28px',
              textDecoration: 'none',
            }}
          >
            Browse Portfolio
          </Link>
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionEyebrow({
  children,
  center = false,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        justifyContent: center ? 'center' : 'flex-start',
      }}
    >
      {!center && <div style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C' }} />}
      <p
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#C9A84C',
          margin: 0,
        }}
      >
        {children}
      </p>
      {!center && <div style={{ flex: 1, height: '1px', backgroundColor: '#4d4637', maxWidth: '320px' }} />}
    </div>
  );
}
