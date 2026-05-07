import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPropertyBySlug, type PropertyDetail, type PropertyCategory, type AreaUnit } from '@/services/propertyService';
import { ApiError } from '@/services/api';
import PropertyGallery from '@/components/PropertyGallery';

// ── Price formatter ───────────────────────────────────────────────────────────
function formatPKR(price: string): string {
  const n = parseFloat(price);
  if (isNaN(n)) return 'Price on Request';
  if (n >= 10_000_000) {
    const cr = n / 10_000_000;
    return `PKR ${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Crore`;
  }
  if (n >= 100_000) {
    const lac = n / 100_000;
    return `PKR ${lac % 1 === 0 ? lac.toFixed(0) : lac.toFixed(2)} Lakh`;
  }
  return `PKR ${n.toLocaleString('en-PK')}`;
}

// ── Category display ──────────────────────────────────────────────────────────
const CATEGORY_LABEL: Record<PropertyCategory, string> = {
  HOUSE:     'House',
  APARTMENT: 'Apartment',
  PLOT:      'Plot',
  OFFICE:    'Office',
  SHOP:      'Shop',
};

// ── Area display ──────────────────────────────────────────────────────────────
const AREA_UNIT_LABEL: Record<AreaUnit, string> = {
  SQ_FT:   'sq ft',
  SQ_YARD: 'sq yard',
  MARLA:   'Marla',
  KANAL:   'Kanal',
};

function formatArea(size: string, unit: AreaUnit): string {
  const n = parseFloat(size);
  if (isNaN(n)) return '';
  const rounded = Number.isInteger(n) ? n.toLocaleString('en-PK') : n.toFixed(2);
  return `${rounded} ${AREA_UNIT_LABEL[unit]}`;
}

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadProperty(slug: string): Promise<PropertyDetail> {
  try {
    return await getPropertyBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const property = await loadProperty(slug);
    return {
      title: `${property.title} — Ventures 92`,
      description: property.description ?? `${CATEGORY_LABEL[property.property_category]} for ${property.availability_status.toLowerCase()} — ${formatPKR(property.price)}`,
    };
  } catch {
    return { title: 'Property — Ventures 92' };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await loadProperty(slug);

  const statusColor = {
    AVAILABLE: { bg: '#C9A84C', color: '#1A1A1A' },
    RESERVED:  { bg: '#7a6a2e', color: '#e9e1d7' },
    SOLD:      { bg: '#2d2a23', color: '#99907e' },
  }[property.availability_status];

  const hasSpecs = property.bedrooms != null || property.bathrooms != null || property.area_size != null;

  return (
    <div style={{ backgroundColor: '#16130d', minHeight: '100vh' }}>

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#1e1b15',
          borderBottom: '1px solid #4d4637',
        }}
      >
        <div
          className="mx-auto"
          style={{ maxWidth: '1600px', paddingInline: '64px', paddingBlock: '16px' }}
        >
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-manrope)',
              fontSize: '12px',
              color: '#99907e',
            }}
          >
            <Link href="/" style={{ color: '#99907e', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: '#4d4637' }}>›</span>
            <Link href="/properties" style={{ color: '#99907e', textDecoration: 'none' }}>Properties</Link>
            <span style={{ color: '#4d4637' }}>›</span>
            <span style={{ color: '#e9e1d7' }}>{property.title}</span>
          </nav>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div
        className="mx-auto"
        style={{
          maxWidth: '1600px',
          paddingInline: '64px',
          paddingBlock: '48px',
        }}
      >
        {/* Two-column layout: content | sidebar */}
        <div
          className="grid gap-10 lg:grid-cols-[1fr_360px]"
          style={{ alignItems: 'start' }}
        >
          {/* ── Left column ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

            {/* Gallery */}
            <PropertyGallery
              media={property.media}
              title={property.title}
              category={property.property_category}
            />

            {/* Title block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Badge row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: statusColor.color,
                    backgroundColor: statusColor.bg,
                    padding: '4px 10px',
                  }}
                >
                  {property.availability_status}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#99907e',
                    border: '1px solid #4d4637',
                    padding: '4px 10px',
                  }}
                >
                  {CATEGORY_LABEL[property.property_category]}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#99907e',
                    border: '1px solid #4d4637',
                    padding: '4px 10px',
                  }}
                >
                  {property.property_type === 'RESIDENTIAL' ? 'Residential' : 'Commercial'}
                </span>
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontFamily: 'var(--font-epilogue)',
                  fontSize: 'clamp(24px, 3vw, 44px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  color: '#e9e1d7',
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                {property.title}
              </h1>

              {/* Price — shown inline on mobile, hidden on desktop (sidebar shows it) */}
              <p
                className="lg:hidden"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  fontSize: '28px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: '#C9A84C',
                  margin: 0,
                }}
              >
                {formatPKR(property.price)}
              </p>
            </div>

            {/* Specs grid */}
            {hasSpecs && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '1px',
                  backgroundColor: '#4d4637',
                  border: '1px solid #4d4637',
                }}
              >
                {property.bedrooms != null && (
                  <SpecCell label="Bedrooms" value={String(property.bedrooms)} icon={<BedIcon />} />
                )}
                {property.bathrooms != null && (
                  <SpecCell label="Bathrooms" value={String(property.bathrooms)} icon={<BathIcon />} />
                )}
                {property.area_size != null && (
                  <SpecCell label="Area" value={formatArea(property.area_size, property.area_unit)} icon={<AreaIcon />} />
                )}
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <SectionHeading>About This Property</SectionHeading>
                <p
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '15px',
                    lineHeight: 1.75,
                    color: '#d0c5b2',
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {property.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SectionHeading>Amenities &amp; Features</SectionHeading>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {property.amenities.map((a) => (
                    <span
                      key={a.id}
                      style={{
                        fontFamily: 'var(--font-manrope)',
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        color: '#d0c5b2',
                        border: '1px solid #4d4637',
                        padding: '8px 16px',
                        backgroundColor: '#1e1b15',
                      }}
                    >
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <aside
            style={{
              position: 'sticky',
              top: '88px',
              backgroundColor: '#1e1b15',
              border: '1px solid #4d4637',
              borderTop: '4px solid #C9A84C',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Price */}
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#99907e',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Asking Price
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  fontSize: '32px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#C9A84C',
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {formatPKR(property.price)}
              </p>
            </div>

            {/* Status */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#16130d',
                border: '1px solid #4d4637',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#99907e',
                }}
              >
                Status
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: statusColor.color,
                  backgroundColor: statusColor.bg,
                  padding: '4px 10px',
                }}
              >
                {property.availability_status}
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: '#4d4637' }} />

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="/contact"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  backgroundColor: '#C9A84C',
                  color: '#1A1A1A',
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '16px 24px',
                  textDecoration: 'none',
                }}
              >
                Book Consultation
              </a>
              <a
                href="https://wa.me/923039640744"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  border: '1px solid #C9A84C',
                  color: '#C9A84C',
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '14px 24px',
                  textDecoration: 'none',
                  backgroundColor: 'transparent',
                }}
              >
                WhatsApp Us
              </a>
              <a
                href="tel:+923039640744"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#99907e',
                  textDecoration: 'none',
                  paddingBlock: '4px',
                }}
              >
                +92 303 964 0744
              </a>
            </div>

            {/* Back link */}
            <Link
              href="/properties"
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: '#4d4637',
                textDecoration: 'none',
                textAlign: 'center',
                paddingTop: '8px',
                borderTop: '1px solid #2d2a23',
              }}
            >
              ← Back to Listings
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ── Small primitives ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-epilogue)',
        fontSize: '18px',
        fontWeight: 700,
        letterSpacing: '-0.01em',
        textTransform: 'uppercase',
        color: '#e9e1d7',
        margin: 0,
        paddingBottom: '12px',
        borderBottom: '1px solid #4d4637',
      }}
    >
      {children}
    </h2>
  );
}

function SpecCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: '#1e1b15',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ color: '#C9A84C', opacity: 0.8 }}>{icon}</div>
      <span
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#99907e',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-space-grotesk)',
          fontSize: '22px',
          fontWeight: 600,
          color: '#e9e1d7',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function BedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 10V14M18 10V14M2 12H18M4 12V8C4 7.448 4.448 7 5 7H15C15.552 7 16 7.448 16 8V12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <rect x="6" y="9" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.5" />
      <rect x="11" y="9" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 10H16V13C16 14.657 14.657 16 13 16H7C5.343 16 4 14.657 4 13V10Z" stroke="currentColor" strokeWidth="1.25" />
      <path d="M4 10V6C4 5.448 4.448 5 5 5C5.552 5 6 5.448 6 6V7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="3" y1="16" x2="4" y2="17" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="17" y1="16" x2="16" y2="17" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" stroke="currentColor" strokeWidth="1.25" />
      <path d="M3 7H17M7 3V17" stroke="currentColor" strokeWidth="1.25" strokeOpacity="0.4" />
    </svg>
  );
}

