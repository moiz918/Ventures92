import { Suspense } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProperties, type Property, type PropertyListParams } from '@/services/propertyService';
import PropertyCard from '@/components/PropertyCard';
import SearchFilters from '@/components/SearchFilters';

// ── Types ────────────────────────────────────────────────────────────────────
type RawParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function fetchProperties(params: RawParams): Promise<{
  data: Property[];
  error: boolean;
}> {
  const query: PropertyListParams = {
    limit: 12,
    offset: str(params.offset) ? parseInt(str(params.offset)!) : 0,
  };

  if (str(params.property_type))     query.property_type     = str(params.property_type) as PropertyListParams['property_type'];
  if (str(params.property_category)) query.property_category = str(params.property_category) as PropertyListParams['property_category'];
  if (str(params.min_price))         query.min_price         = str(params.min_price);
  if (str(params.max_price))         query.max_price         = str(params.max_price);
  if (str(params.availability_status)) query.availability_status = str(params.availability_status) as PropertyListParams['availability_status'];

  try {
    const data = await getProperties(query);
    return { data, error: false };
  } catch {
    return { data: [], error: true };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const params = await searchParams;

  // ── Translate hero's `budget` shorthand → explicit min/max + redirect ──────
  // Keeps the filter bar's selects in sync (they read min_price/max_price).
  if (str(params.budget)) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (k !== 'budget' && typeof v === 'string') next.set(k, v);
    }
    switch (str(params.budget)) {
      case 'u50m':       next.set('max_price', '50000000');                                      break;
      case '50m-150m':   next.set('min_price', '50000000'); next.set('max_price', '150000000'); break;
      case '150m-plus':  next.set('min_price', '150000000');                                     break;
    }
    redirect(`/properties?${next.toString()}`);
  }

  const { data: properties, error } = await fetchProperties(params);

  const hasFilters = !!(
    str(params.property_type) ||
    str(params.property_category) ||
    str(params.min_price) ||
    str(params.max_price)
  );

  return (
    <div style={{ backgroundColor: '#16130d', minHeight: '100vh' }}>

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#1e1b15',
          borderBottom: '1px solid #4d4637',
        }}
      >
        <div
          className="mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          style={{ maxWidth: '1600px', paddingInline: '64px', paddingBlock: '40px' }}
        >
          <div className="flex flex-col gap-2">
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
              Real Estate Portfolio
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
              {hasFilters ? 'Search Results' : 'All Properties'}
            </h1>
          </div>

          {/* Result count */}
          {!error && (
            <span
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: '14px',
                color: '#99907e',
                paddingBottom: '4px',
              }}
            >
              {properties.length === 12
                ? '12+ listings'
                : `${properties.length} ${properties.length === 1 ? 'listing' : 'listings'}`}
            </span>
          )}
        </div>
      </div>

      {/* ── Sticky filter bar ──────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: '64px', zIndex: 40 }}>
        {/*
          SearchFilters uses useSearchParams() which requires Suspense.
          The fallback is the same bar without interactive controls so
          the layout doesn't shift on hydration.
        */}
        <Suspense fallback={<FilterBarSkeleton />}>
          <SearchFilters />
        </Suspense>
      </div>

      {/* ── Results area ───────────────────────────────────────────────── */}
      <div
        className="mx-auto"
        style={{ maxWidth: '1600px', paddingInline: '64px', paddingBlock: '48px' }}
      >
        {error ? (
          <ErrorState />
        ) : properties.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
            }}
          >
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Filter bar skeleton (Suspense fallback) ───────────────────────────────────
function FilterBarSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#1e1b15',
        borderBottom: '1px solid #4d4637',
        borderTop: '1px solid #4d4637',
      }}
    >
      <div
        className="mx-auto flex items-end gap-4"
        style={{ maxWidth: '1600px', paddingInline: '64px', paddingBlock: '20px' }}
      >
        {(['Type', 'Category', 'Min Price', 'Max Price'] as const).map((label) => (
          <div key={label}>
            <div
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#99907e',
                marginBottom: '6px',
              }}
            >
              {label}
            </div>
            <div
              style={{
                width: label === 'Category' ? '160px' : '140px',
                height: '38px',
                backgroundColor: '#16130d',
                border: '1px solid #4d4637',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-6 py-24 text-center mx-auto"
      style={{ maxWidth: '480px' }}
    >
      {/* Search-off icon */}
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ opacity: 0.35 }}>
        <circle cx="24" cy="24" r="18" stroke="#C9A84C" strokeWidth="1.5" />
        <line x1="37" y1="37" x2="50" y2="50" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="18" x2="30" y2="30" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="30" y1="18" x2="18" y2="30" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <div className="flex flex-col gap-2">
        <p
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: '#e9e1d7',
            margin: 0,
          }}
        >
          No Properties Found
        </p>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '14px',
            color: '#99907e',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {hasFilters
            ? 'No properties match your current criteria. Try adjusting your filters or clearing them to see all available listings.'
            : 'No properties are currently available. Check back soon or contact us directly.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {hasFilters && (
          <Link
            href="/properties"
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              backgroundColor: '#C9A84C',
              padding: '12px 24px',
              textDecoration: 'none',
            }}
          >
            Clear Filters
          </Link>
        )}
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
            padding: '12px 24px',
            textDecoration: 'none',
          }}
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ErrorState() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-24 text-center mx-auto"
      style={{ maxWidth: '480px' }}
    >
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ opacity: 0.4 }}>
        <circle cx="28" cy="28" r="26" stroke="#C9A84C" strokeWidth="1.5" />
        <line x1="28" y1="16" x2="28" y2="30" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="28" cy="38" r="2" fill="#C9A84C" />
      </svg>
      <div className="flex flex-col gap-2">
        <p
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: '#e9e1d7',
            margin: 0,
          }}
        >
          Listings Unavailable
        </p>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '14px',
            color: '#99907e',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          We&apos;re having trouble connecting to our listings right now.
          Please try again or contact us for assistance.
        </p>
      </div>
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
          padding: '12px 24px',
          textDecoration: 'none',
        }}
      >
        Contact Us
      </Link>
    </div>
  );
}
