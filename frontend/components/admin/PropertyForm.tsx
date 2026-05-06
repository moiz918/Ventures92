'use client';

import { useState, useCallback } from 'react';
import {
  createProperty,
  type Property,
  type PropertyType,
  type PropertyCategory,
  type AvailabilityStatus,
} from '@/services/propertyService';
import { ApiError } from '@/services/api';

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
  onSuccess: (property: Property) => void;
}

// ── Form state ────────────────────────────────────────────────────────────────
interface FormState {
  title: string;
  description: string;
  price: string;
  area_sqft: string;
  property_type: PropertyType;
  property_category: PropertyCategory;
  availability_status: AvailabilityStatus;
  bedrooms: string;
  bathrooms: string;
  floors: string;
  is_featured: boolean;
}

const INITIAL: FormState = {
  title: '',
  description: '',
  price: '',
  area_sqft: '',
  property_type: 'RESIDENTIAL',
  property_category: 'APARTMENT',
  availability_status: 'AVAILABLE',
  bedrooms: '',
  bathrooms: '',
  floors: '',
  is_featured: false,
};

// ── Feature flags (checkboxes) ────────────────────────────────────────────────
const FEATURE_FLAGS: { key: keyof Pick<FormState, 'is_featured'>; label: string }[] = [
  { key: 'is_featured', label: 'Featured Listing' },
];

const BOOLEAN_FEATURES = [
  'Swimming Pool',
  'Gymnasium',
  'Parking',
  'Generator Backup',
  'Security / CCTV',
  'Elevator / Lift',
  'Rooftop Access',
  'Community Park',
  'Smart Home',
  'Solar Energy',
  'Central AC',
  'Servants Quarters',
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-manrope)',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#4d4637',
  display: 'block',
  marginBottom: '6px',
};

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%',
    backgroundColor: '#100e08',
    border: `1px solid ${focused ? '#C9A84C' : '#4d4637'}`,
    color: '#e9e1d7',
    fontFamily: 'var(--font-manrope)',
    fontSize: '14px',
    padding: '12px 14px',
    outline: 'none',
    transition: 'border-color 0.15s',
  };
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#C9A84C',
          margin: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </p>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#4d4637' }} />
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PropertyForm({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [focused, setFocused] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const toggleFeature = useCallback((name: string) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        property_type: form.property_type,
        property_category: form.property_category,
        price: form.price.trim(),
        area_sqft: form.area_sqft.trim() || undefined,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms, 10) : undefined,
        floors: form.floors ? parseInt(form.floors, 10) : undefined,
        availability_status: form.availability_status,
        is_featured: form.is_featured,
      };

      const created = await createProperty(payload);
      onSuccess(created);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 422 ? 'Please check your details — some fields are invalid.' : err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Overlay */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'relative',
          width: '600px',
          maxWidth: '100vw',
          height: '100vh',
          backgroundColor: '#16130d',
          borderLeft: '1px solid #4d4637',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Panel header */}
        <div
          style={{
            height: '64px',
            flexShrink: 0,
            borderBottom: '1px solid #4d4637',
            backgroundColor: '#1e1b15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInline: '28px',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#C9A84C',
                margin: '0 0 2px',
              }}
            >
              Admin
            </p>
            <p
              style={{
                fontFamily: 'var(--font-epilogue)',
                fontSize: '15px',
                fontWeight: 700,
                color: '#e9e1d7',
                margin: 0,
              }}
            >
              Add New Property
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              border: '1px solid #4d4637',
              backgroundColor: 'transparent',
              color: '#99907e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Close panel"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable form body */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '36px',
            opacity: submitting ? 0.7 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {/* ── Section 1: Basic Info ──────────────────────────── */}
          <section>
            <SectionHeading>Basic Info</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Title */}
              <div>
                <label style={labelStyle}>Property Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  onFocus={() => setFocused('title')}
                  onBlur={() => setFocused('')}
                  style={inputStyle(focused === 'title')}
                  placeholder="e.g. Luxury 3BR Apartment in DHA Phase 6"
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  onFocus={() => setFocused('description')}
                  onBlur={() => setFocused('')}
                  style={{
                    ...inputStyle(focused === 'description'),
                    resize: 'vertical',
                    minHeight: '100px',
                  }}
                  placeholder="Detailed property description…"
                />
              </div>

              {/* Price + Area */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Price (PKR) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                    onFocus={() => setFocused('price')}
                    onBlur={() => setFocused('')}
                    style={inputStyle(focused === 'price')}
                    placeholder="e.g. 7500000"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Area (sqft)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.area_sqft}
                    onChange={(e) => set('area_sqft', e.target.value)}
                    onFocus={() => setFocused('area_sqft')}
                    onBlur={() => setFocused('')}
                    style={inputStyle(focused === 'area_sqft')}
                    placeholder="e.g. 2400"
                  />
                </div>
              </div>

              {/* Beds + Baths + Floors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={form.bedrooms}
                    onChange={(e) => set('bedrooms', e.target.value)}
                    onFocus={() => setFocused('bedrooms')}
                    onBlur={() => setFocused('')}
                    style={inputStyle(focused === 'bedrooms')}
                    placeholder="3"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={form.bathrooms}
                    onChange={(e) => set('bathrooms', e.target.value)}
                    onFocus={() => setFocused('bathrooms')}
                    onBlur={() => setFocused('')}
                    style={inputStyle(focused === 'bathrooms')}
                    placeholder="2"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Floors</label>
                  <input
                    type="number"
                    min="1"
                    value={form.floors}
                    onChange={(e) => set('floors', e.target.value)}
                    onFocus={() => setFocused('floors')}
                    onBlur={() => setFocused('')}
                    style={inputStyle(focused === 'floors')}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 2: Classification ──────────────────────── */}
          <section>
            <SectionHeading>Classification</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Type + Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Property Type *</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      required
                      value={form.property_type}
                      onChange={(e) => set('property_type', e.target.value as PropertyType)}
                      onFocus={() => setFocused('property_type')}
                      onBlur={() => setFocused('')}
                      style={{
                        ...inputStyle(focused === 'property_type'),
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        paddingRight: '36px',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="RESIDENTIAL">Residential</option>
                      <option value="COMMERCIAL">Commercial</option>
                    </select>
                    <ChevronIcon />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      required
                      value={form.property_category}
                      onChange={(e) => set('property_category', e.target.value as PropertyCategory)}
                      onFocus={() => setFocused('property_category')}
                      onBlur={() => setFocused('')}
                      style={{
                        ...inputStyle(focused === 'property_category'),
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        paddingRight: '36px',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="APARTMENT">Apartment</option>
                      <option value="HOUSE">House</option>
                      <option value="PLOT">Plot</option>
                      <option value="OFFICE">Office</option>
                      <option value="SHOP">Shop</option>
                    </select>
                    <ChevronIcon />
                  </div>
                </div>
              </div>

              {/* Availability status */}
              <div>
                <label style={labelStyle}>Availability Status *</label>
                <div style={{ position: 'relative' }}>
                  <select
                    required
                    value={form.availability_status}
                    onChange={(e) => set('availability_status', e.target.value as AvailabilityStatus)}
                    onFocus={() => setFocused('availability_status')}
                    onBlur={() => setFocused('')}
                    style={{
                      ...inputStyle(focused === 'availability_status'),
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      paddingRight: '36px',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="SOLD">Sold</option>
                  </select>
                  <ChevronIcon />
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 3: Features & Amenities ───────────────── */}
          <section>
            <SectionHeading>Features &amp; Amenities</SectionHeading>

            {/* is_featured toggle */}
            <div style={{ marginBottom: '20px' }}>
              <ToggleRow
                checked={form.is_featured}
                onChange={(v) => set('is_featured', v)}
                label="Featured Listing"
                description="Highlights this property on the homepage"
              />
            </div>

            {/* Amenity grid */}
            <div>
              <p style={{ ...labelStyle, marginBottom: '12px' }}>Amenities</p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                }}
              >
                {BOOLEAN_FEATURES.map((name) => {
                  const checked = selectedFeatures.has(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleFeature(name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        border: `1px solid ${checked ? '#C9A84C' : '#4d4637'}`,
                        backgroundColor: checked ? 'rgba(201,168,76,0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, background-color 0.15s',
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          border: `1px solid ${checked ? '#C9A84C' : '#4d4637'}`,
                          backgroundColor: checked ? '#C9A84C' : 'transparent',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.15s',
                        }}
                      >
                        {checked && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                            <path d="M1 3l2 2 4-4" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-manrope)',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          color: checked ? '#C9A84C' : '#99907e',
                          transition: 'color 0.15s',
                        }}
                      >
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div
              style={{
                border: '1px solid #4d4637',
                backgroundColor: '#1e1b15',
                padding: '14px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="8" cy="8" r="7" stroke="#99907e" strokeWidth="1.25" />
                <path d="M8 5v4M8 11v.5" stroke="#99907e" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', color: '#99907e', margin: 0 }}>
                {error}
              </p>
            </div>
          )}
        </form>

        {/* Panel footer */}
        <div
          style={{
            flexShrink: 0,
            borderTop: '1px solid #4d4637',
            backgroundColor: '#1e1b15',
            padding: '16px 28px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#99907e',
              border: '1px solid #4d4637',
              backgroundColor: 'transparent',
              padding: '12px 24px',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="property-form"
            disabled={submitting}
            onClick={handleSubmit as unknown as React.MouseEventHandler<HTMLButtonElement>}
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              backgroundColor: submitting ? '#99907e' : '#C9A84C',
              border: 'none',
              padding: '12px 24px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {submitting ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12 22" />
                </svg>
                Publishing…
              </>
            ) : (
              'Publish Property'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        color: '#4d4637',
      }}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        border: `1px solid ${checked ? '#C9A84C' : '#4d4637'}`,
        backgroundColor: checked ? 'rgba(201,168,76,0.06)' : 'transparent',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background-color 0.15s',
        textAlign: 'left',
      }}
    >
      <div>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: checked ? '#C9A84C' : '#d0c5b2',
            margin: '0 0 2px',
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '11px',
            color: '#4d4637',
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
      {/* Toggle pill */}
      <div
        style={{
          width: '36px',
          height: '20px',
          backgroundColor: checked ? '#C9A84C' : '#2d2a23',
          border: `1px solid ${checked ? '#C9A84C' : '#4d4637'}`,
          position: 'relative',
          flexShrink: 0,
          transition: 'background-color 0.2s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '3px',
            left: checked ? '17px' : '3px',
            width: '12px',
            height: '12px',
            backgroundColor: checked ? '#1A1A1A' : '#4d4637',
            transition: 'left 0.2s, background-color 0.2s',
          }}
        />
      </div>
    </button>
  );
}
