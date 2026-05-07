import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import CorporatePartners from '@/components/CorporatePartners';
import PropertyCard from '@/components/PropertyCard';
import { getProperties, type Property } from '@/services/propertyService';

// ── Data fetching ────────────────────────────────────────────────────────────
async function fetchFeaturedProperties(): Promise<{
  data: Property[];
  error: boolean;
}> {
  try {
    const data = await getProperties({ is_featured: true, limit: 6 });
    return { data, error: false };
  } catch {
    return { data: [], error: true };
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const { data: properties, error } = await fetchFeaturedProperties();

  return (
    <>
      <HeroSection />

      {/* ── Corporate Partners ──────────────────────────────────────────── */}
      {/* `id` enables /#partners footer anchor scroll */}
      <div id="partners" style={{ scrollMarginTop: '64px' }}>
        <CorporatePartners />
      </div>

      {/* ── Featured Properties ─────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#16130d', paddingBlock: '120px' }}>
        <div
          className="mx-auto"
          style={{ maxWidth: '1600px', paddingInline: '64px' }}
        >
          {/* Section header */}
          <div
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
            style={{ marginBottom: '56px' }}
          >
            <div className="flex flex-col gap-3">
              <span
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                }}
              >
                Featured Portfolio
              </span>
              <h2
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
                Featured Properties
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '15px',
                  color: '#d0c5b2',
                  maxWidth: '480px',
                  margin: 0,
                  lineHeight: 1.65,
                }}
              >
                Curated properties representing the pinnacle of architectural
                design and investment value.
              </p>
            </div>

            <Link
              href="/properties"
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                paddingBottom: '2px',
                borderBottom: '1px solid rgba(201,168,76,0.4)',
              }}
            >
              View All Portfolio →
            </Link>
          </div>

          {/* ── Grid states ──────────────────────────────────────────────── */}
          {error ? (
            <ErrorState />
          ) : properties.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
              }}
            >
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ── Fallback UIs ─────────────────────────────────────────────────────────────
function ErrorState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-20 text-center"
      style={{
        border: '1px solid #4d4637',
        backgroundColor: '#1e1b15',
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        style={{ opacity: 0.4 }}
      >
        <circle cx="24" cy="24" r="22" stroke="#C9A84C" strokeWidth="1.5" />
        <line x1="24" y1="14" x2="24" y2="26" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="32" r="1.5" fill="#C9A84C" />
      </svg>
      <p
        style={{
          fontFamily: 'var(--font-epilogue)',
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          color: '#e9e1d7',
          margin: 0,
        }}
      >
        Properties Unavailable
      </p>
      <p
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '14px',
          color: '#99907e',
          maxWidth: '360px',
          margin: 0,
          lineHeight: 1.65,
        }}
      >
        We&apos;re having trouble connecting to our listings. Please try again
        shortly or contact us directly.
      </p>
      <a
        href="/contact"
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#C9A84C',
          textDecoration: 'none',
          border: '1px solid #C9A84C',
          padding: '12px 24px',
          marginTop: '8px',
        }}
      >
        Contact Us
      </a>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-20 text-center"
      style={{
        border: '1px solid #4d4637',
        backgroundColor: '#1e1b15',
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        style={{ opacity: 0.35 }}
      >
        <path d="M24 6L40 20V42H8V20L24 6Z" stroke="#C9A84C" strokeWidth="1.5" />
        <rect x="18" y="30" width="12" height="12" stroke="#C9A84C" strokeWidth="1.5" />
      </svg>
      <p
        style={{
          fontFamily: 'var(--font-epilogue)',
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          color: '#e9e1d7',
          margin: 0,
        }}
      >
        No Featured Properties Yet
      </p>
      <p
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '14px',
          color: '#99907e',
          maxWidth: '360px',
          margin: 0,
          lineHeight: 1.65,
        }}
      >
        Our curated portfolio is being assembled. Browse the full listings below.
      </p>
      <Link
        href="/properties"
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#1A1A1A',
          textDecoration: 'none',
          backgroundColor: '#C9A84C',
          padding: '12px 24px',
          marginTop: '8px',
        }}
      >
        Browse All Properties
      </Link>
    </div>
  );
}
