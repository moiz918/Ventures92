'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { type Location } from '@/services/locationService';

// ── Filter option data ──────────────────────────────────────────────────────
const TYPE_OPTIONS = [
  { label: 'All Types',    value: '' },
  { label: 'Residential',  value: 'RESIDENTIAL' },
  { label: 'Commercial',   value: 'COMMERCIAL' },
] as const;

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Plot',           value: 'PLOT' },
  { label: 'House',          value: 'HOUSE' },
  { label: 'Apartment',      value: 'APARTMENT' },
  { label: 'Office',         value: 'OFFICE' },
  { label: 'Shop',           value: 'SHOP' },
] as const;

const MIN_PRICE_OPTIONS = [
  { label: 'No Minimum',  value: '' },
  { label: '1 Cr+',       value: '10000000' },
  { label: '5 Cr+',       value: '50000000' },
  { label: '10 Cr+',      value: '100000000' },
  { label: '15 Cr+',      value: '150000000' },
  { label: '50 Cr+',      value: '500000000' },
] as const;

const MAX_PRICE_OPTIONS = [
  { label: 'No Maximum',   value: '' },
  { label: 'Up to 1 Cr',  value: '10000000' },
  { label: 'Up to 5 Cr',  value: '50000000' },
  { label: 'Up to 10 Cr', value: '100000000' },
  { label: 'Up to 15 Cr', value: '150000000' },
  { label: 'Up to 50 Cr', value: '500000000' },
] as const;

// ── Shared styles ───────────────────────────────────────────────────────────
const LABEL: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-manrope)',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#99907e',
  marginBottom: '6px',
};

const SELECT: React.CSSProperties = {
  backgroundColor: '#16130d',
  border: '1px solid #4d4637',
  color: '#e9e1d7',
  fontFamily: 'var(--font-manrope)',
  fontSize: '13px',
  padding: '9px 12px',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  width: '100%',
  minWidth: '140px',
};

// ── Component ───────────────────────────────────────────────────────────────
export default function SearchFilters({ locations = [] }: { locations?: Location[] }) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentType       = searchParams.get('property_type')     ?? '';
  const currentCategory   = searchParams.get('property_category') ?? '';
  const currentLocationId = searchParams.get('location_id')       ?? '';
  const currentMin        = searchParams.get('min_price')          ?? '';
  const currentMax        = searchParams.get('max_price')          ?? '';

  const activeCount = [currentType, currentCategory, currentLocationId, currentMin, currentMax].filter(Boolean).length;

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete('offset'); // reset pagination on any filter change
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  const clearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [router, pathname]);

  return (
    <div
      style={{
        backgroundColor: '#1e1b15',
        borderBottom: '1px solid #4d4637',
        borderTop: '1px solid #4d4637',
        opacity: isPending ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <div
        className="mx-auto flex flex-wrap items-end gap-4"
        style={{
          maxWidth: '1600px',
          paddingInline: '64px',
          paddingBlock: '20px',
        }}
      >
        {/* Property Type */}
        <FilterField label="Type">
          <select
            style={SELECT}
            value={currentType}
            onChange={(e) => update('property_type', e.target.value)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FilterField>

        {/* Category */}
        <FilterField label="Category">
          <select
            style={{ ...SELECT, minWidth: '160px' }}
            value={currentCategory}
            onChange={(e) => update('property_category', e.target.value)}
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FilterField>

        {/* Location */}
        {locations.length > 0 && (
          <FilterField label="Location">
            <select
              style={{ ...SELECT, minWidth: '180px' }}
              value={currentLocationId}
              onChange={(e) => update('location_id', e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.city} — {loc.region_or_society}
                </option>
              ))}
            </select>
          </FilterField>
        )}

        {/* Min Price */}
        <FilterField label="Min Price">
          <select
            style={SELECT}
            value={currentMin}
            onChange={(e) => update('min_price', e.target.value)}
          >
            {MIN_PRICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FilterField>

        {/* Max Price */}
        <FilterField label="Max Price">
          <select
            style={SELECT}
            value={currentMax}
            onChange={(e) => update('max_price', e.target.value)}
          >
            {MAX_PRICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FilterField>

        {/* Spacer + right-side controls */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Active filter badge */}
          {activeCount > 0 && (
            <span
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#C9A84C',
              }}
            >
              {activeCount} {activeCount === 1 ? 'filter' : 'filters'} active
            </span>
          )}

          {/* Clear button — only shown when filters are applied */}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#e9e1d7',
                background: 'transparent',
                border: '1px solid #4d4637',
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helper wrapper ──────────────────────────────────────────────────────────
function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  );
}
