import Link from 'next/link';
import type { Property } from '@/services/propertyService';

// ── Price formatting ────────────────────────────────────────────────────────
function formatPKR(price: string): string {
  const num = parseFloat(price);
  if (isNaN(num) || num <= 0) return 'Price on Request';
  if (num >= 10_000_000) {
    const cr = num / 10_000_000;
    return `PKR ${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
  }
  if (num >= 100_000) {
    const l = num / 100_000;
    return `PKR ${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)} L`;
  }
  return `PKR ${Math.round(num).toLocaleString('en-PK')}`;
}

// ── Status badge config ─────────────────────────────────────────────────────
const STATUS: Record<string, { label: string; bg: string; color: string }> = {
  AVAILABLE: { label: 'Available',  bg: '#C9A84C', color: '#1A1A1A' },
  RESERVED:  { label: 'Reserved',   bg: '#E8A020', color: '#1A1A1A' },
  SOLD:      { label: 'Sold',       bg: '#4d4637', color: '#e9e1d7' },
};

// ── Per-category gradient placeholder (no image) ───────────────────────────
const GRADIENTS: Record<string, string> = {
  HOUSE:     'linear-gradient(145deg, #2d2a23 0%, #1e1b15 100%)',
  APARTMENT: 'linear-gradient(145deg, #221f19 0%, #16130d 100%)',
  PLOT:      'linear-gradient(145deg, #38342d 0%, #221f19 100%)',
  OFFICE:    'linear-gradient(145deg, #1e1b15 0%, #100e08 100%)',
  SHOP:      'linear-gradient(145deg, #2d2a23 0%, #16130d 100%)',
};

// ── Props ───────────────────────────────────────────────────────────────────
interface PropertyCardProps {
  property: Property;
  /** Optional primary image URL — when absent, an architectural gradient is shown */
  imageUrl?: string;
}

// ── Component ───────────────────────────────────────────────────────────────
export default function PropertyCard({ property, imageUrl }: PropertyCardProps) {
  const badge    = STATUS[property.availability_status] ?? STATUS.AVAILABLE;
  const gradient = GRADIENTS[property.property_category] ?? GRADIENTS.HOUSE;
  const areaNum  = property.area_sqft ? parseFloat(property.area_sqft) : null;

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group flex flex-col"
      style={{
        backgroundColor: '#2d2a23',
        border: '1px solid #4d4637',
        textDecoration: 'none',
        transition: 'border-color 0.2s',
      }}
    >
      {/* ── Image / placeholder ──────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '16 / 9', background: gradient }}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={property.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
        />

        {/* Category watermark (placeholder only) */}
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <BuildingIcon category={property.property_category} />
          </div>
        )}

        {/* Status badge — top left */}
        <span
          className="absolute top-3 left-3"
          style={{
            backgroundColor: badge.bg,
            color: badge.color,
            fontFamily: 'var(--font-manrope)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '4px 10px',
          }}
        >
          {badge.label}
        </span>

        {/* Type badge — top right */}
        <span
          className="absolute top-3 right-3"
          style={{
            backgroundColor: 'rgba(22,19,13,0.85)',
            color: '#d0c5b2',
            fontFamily: 'var(--font-manrope)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '4px 10px',
            border: '1px solid #4d4637',
          }}
        >
          {property.property_type === 'RESIDENTIAL' ? 'Residential' : 'Commercial'}
        </span>

        {/* PKR price overlay — bottom left (Space Grotesk per design system) */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            background: 'linear-gradient(to top, rgba(16,14,8,0.85) 0%, transparent 100%)',
            padding: '32px 14px 12px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: '18px',
              fontWeight: 500,
              letterSpacing: '0.02em',
              color: '#e6c364',
            }}
          >
            {formatPKR(property.price)}
          </span>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-5">
        {/* Category pill */}
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
          {property.property_category.charAt(0) + property.property_category.slice(1).toLowerCase()}
        </span>

        {/* Title */}
        <h3
          className="text-on-surface group-hover:text-gold transition-colors duration-200"
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: '16px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            lineHeight: 1.25,
          }}
        >
          {property.title}
        </h3>

        {/* Specs row */}
        {(property.bedrooms != null || property.bathrooms != null || areaNum != null) && (
          <div className="flex items-center gap-4 flex-wrap">
            {property.bedrooms != null && (
              <SpecItem icon={<BedIcon />} value={`${property.bedrooms} Bed`} />
            )}
            {property.bathrooms != null && (
              <SpecItem icon={<BathIcon />} value={`${property.bathrooms} Bath`} />
            )}
            {areaNum != null && (
              <SpecItem icon={<AreaIcon />} value={`${areaNum.toLocaleString()} sqft`} />
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#4d4637' }} />

        {/* View details CTA */}
        <span
          className="self-start group-hover:underline"
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#C9A84C',
          }}
        >
          View Details →
        </span>
      </div>
    </Link>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────
function SpecItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="flex items-center gap-1.5">
      {icon}
      <span
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '12px',
          color: '#d0c5b2',
        }}
      >
        {value}
      </span>
    </span>
  );
}

function BuildingIcon({ category }: { category: string }) {
  const isCommercial = ['OFFICE', 'SHOP'].includes(category);
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      style={{ opacity: 0.15 }}
    >
      {isCommercial ? (
        <>
          <rect x="8" y="4" width="32" height="40" stroke="#C9A84C" strokeWidth="1.5" />
          <line x1="8" y1="16" x2="40" y2="16" stroke="#C9A84C" strokeWidth="1.5" />
          <line x1="8" y1="28" x2="40" y2="28" stroke="#C9A84C" strokeWidth="1.5" />
          <line x1="20" y1="4" x2="20" y2="44" stroke="#C9A84C" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <path d="M24 4L40 18V44H8V18L24 4Z" stroke="#C9A84C" strokeWidth="1.5" />
          <rect x="18" y="30" width="12" height="14" stroke="#C9A84C" strokeWidth="1.5" />
          <rect x="14" y="22" width="8" height="8" stroke="#C9A84C" strokeWidth="1.5" />
          <rect x="26" y="22" width="8" height="8" stroke="#C9A84C" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}

function BedIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="8" width="14" height="6" stroke="#99907e" strokeWidth="1.2" />
      <rect x="1" y="5" width="5.5" height="4" stroke="#99907e" strokeWidth="1.2" />
      <line x1="1" y1="14" x2="1" y2="16" stroke="#99907e" strokeWidth="1.2" />
      <line x1="15" y1="14" x2="15" y2="16" stroke="#99907e" strokeWidth="1.2" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" stroke="#99907e" strokeWidth="1.2" />
      <path d="M3 8V4a1 1 0 0 1 1-1h1.5v5" stroke="#99907e" strokeWidth="1.2" />
      <line x1="1" y1="8" x2="15" y2="8" stroke="#99907e" strokeWidth="1.2" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="14" height="14" stroke="#99907e" strokeWidth="1.2" />
      <path d="M1 5.5h3V1" stroke="#99907e" strokeWidth="1.2" />
      <path d="M15 10.5h-3V15" stroke="#99907e" strokeWidth="1.2" />
    </svg>
  );
}
