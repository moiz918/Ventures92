'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createProperty,
  updateProperty,
  getAmenities,
  uploadPropertyMedia,
  type Amenity,
  type Property,
  type PropertyType,
  type PropertyCategory,
  type AvailabilityStatus,
  type AreaUnit,
  type PropertyCreatePayload,
  type PropertyUpdatePayload,
} from '@/services/propertyService';
import { ApiError } from '@/services/api';

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
  onSuccess: (property: Property) => void;
  /** When provided the form opens in edit mode and pre-fills all fields. */
  property?: Property;
}

// ── Form state ────────────────────────────────────────────────────────────────
interface FormState {
  title: string;
  description: string;
  price: string;
  area_size: string;
  area_unit: AreaUnit;
  property_type: PropertyType;
  property_category: PropertyCategory;
  availability_status: AvailabilityStatus;
  bedrooms: string;
  bathrooms: string;
  is_featured: boolean;
}

function initialFormState(p?: Property): FormState {
  return {
    title:               p?.title                ?? '',
    description:         p?.description          ?? '',
    price:               p?.price                ?? '',
    area_size:           p?.area_size             ?? '',
    area_unit:           p?.area_unit             ?? 'SQ_FT',
    property_type:       p?.property_type         ?? 'RESIDENTIAL',
    property_category:   p?.property_category     ?? 'APARTMENT',
    availability_status: p?.availability_status   ?? 'AVAILABLE',
    bedrooms:            p?.bedrooms != null ? String(p.bedrooms) : '',
    bathrooms:           p?.bathrooms != null ? String(p.bathrooms) : '',
    is_featured:         p?.is_featured           ?? false,
  };
}

const AREA_UNIT_LABELS: Record<AreaUnit, string> = {
  SQ_FT:   'Sq. Ft',
  SQ_YARD: 'Sq. Yard',
  MARLA:   'Marla',
  KANAL:   'Kanal',
};

// ── Pending upload entry ───────────────────────────────────────────────────────
interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  uploadedUrl?: string;
  errorMsg?: string;
}

// ── Style helpers ─────────────────────────────────────────────────────────────
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
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
export default function PropertyForm({ onClose, onSuccess, property }: Props) {
  const isEditMode = Boolean(property);

  const [form, setForm] = useState<FormState>(() => initialFormState(property));
  const [focused, setFocused] = useState('');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(new Set());
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load amenities on mount
  useEffect(() => {
    getAmenities().then(setAmenities).catch(() => {
      // Non-fatal — form still works without amenities
    });
  }, []);

  // Pre-select amenities when editing (PropertyDetail has amenities array)
  useEffect(() => {
    if (property && 'amenities' in property) {
      const detail = property as Property & { amenities?: Amenity[] };
      if (detail.amenities?.length) {
        setSelectedAmenityIds(new Set(detail.amenities.map((a) => a.id)));
      }
    }
  }, [property]);

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const toggleAmenity = useCallback((id: string) => {
    setSelectedAmenityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Image selection ──────────────────────────────────────────────────────
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newEntries: PendingImage[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));

    setPendingImages((prev) => [...prev, ...newEntries]);
    // Reset so the same file can be re-selected after removal
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const removeImage = useCallback((id: string) => {
    setPendingImages((prev) => {
      const entry = prev.find((i) => i.id === id);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  // Upload all pending images sequentially; return collected URLs
  const uploadAllImages = useCallback(async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const entry of pendingImages) {
      if (entry.status === 'done' && entry.uploadedUrl) {
        urls.push(entry.uploadedUrl);
        continue;
      }
      if (entry.status !== 'pending') continue;

      setPendingImages((prev) =>
        prev.map((i) => (i.id === entry.id ? { ...i, status: 'uploading' } : i)),
      );

      try {
        const result = await uploadPropertyMedia(entry.file);
        urls.push(result.url);
        setPendingImages((prev) =>
          prev.map((i) =>
            i.id === entry.id ? { ...i, status: 'done', uploadedUrl: result.url } : i,
          ),
        );
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Upload failed';
        setPendingImages((prev) =>
          prev.map((i) =>
            i.id === entry.id ? { ...i, status: 'error', errorMsg: msg } : i,
          ),
        );
        throw new Error(`Image upload failed: ${msg}`);
      }
    }

    return urls;
  }, [pendingImages]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Step 1: upload any pending images first, collect their URLs
      const uploadedUrls = await uploadAllImages();

      const sharedFields = {
        description:         form.description.trim() || undefined,
        property_type:       form.property_type,
        property_category:   form.property_category,
        price:               form.price.trim(),
        area_size:           form.area_size.trim() || undefined,
        area_unit:           form.area_unit,
        bedrooms:            form.bedrooms ? parseInt(form.bedrooms, 10) : undefined,
        bathrooms:           form.bathrooms ? parseInt(form.bathrooms, 10) : undefined,
        availability_status: form.availability_status,
        is_featured:         form.is_featured,
        amenity_ids:         selectedAmenityIds.size > 0 ? Array.from(selectedAmenityIds) : undefined,
        // Pass uploaded media URLs so the backend can persist PropertyMedia rows
        ...(uploadedUrls.length > 0 ? { media_urls: uploadedUrls } : {}),
      };

      let saved: Property;
      if (isEditMode && property) {
        const payload: PropertyUpdatePayload = { title: form.title.trim(), ...sharedFields };
        saved = await updateProperty(property.id, payload);
      } else {
        const payload: PropertyCreatePayload = {
          title:               form.title.trim(),
          property_type:       form.property_type,
          property_category:   form.property_category,
          price:               form.price.trim(),
          area_size:           form.area_size.trim(),
          area_unit:           form.area_unit,
          availability_status: form.availability_status,
          is_featured:         form.is_featured,
          ...sharedFields,
        };
        saved = await createProperty(payload);
      }

      onSuccess(saved);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 422
            ? 'Please check your details — some fields are invalid.'
            : err.message,
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
      />

      {/* Panel — responsive: full-width on small screens, max 600px on desktop */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '600px',
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
            <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', margin: '0 0 2px' }}>
              Admin
            </p>
            <p style={{ fontFamily: 'var(--font-epilogue)', fontSize: '15px', fontWeight: 700, color: '#e9e1d7', margin: 0 }}>
              {isEditMode ? 'Edit Property' : 'Add New Property'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ width: '36px', height: '36px', border: '1px solid #4d4637', backgroundColor: 'transparent', color: '#99907e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
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

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  onFocus={() => setFocused('description')}
                  onBlur={() => setFocused('')}
                  style={{ ...inputStyle(focused === 'description'), resize: 'vertical', minHeight: '100px' }}
                  placeholder="Detailed property description…"
                />
              </div>

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
                  <label style={labelStyle}>Area Size</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.area_size}
                    onChange={(e) => set('area_size', e.target.value)}
                    onFocus={() => setFocused('area_size')}
                    onBlur={() => setFocused('')}
                    style={inputStyle(focused === 'area_size')}
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Area Unit</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={form.area_unit}
                      onChange={(e) => set('area_unit', e.target.value as AreaUnit)}
                      onFocus={() => setFocused('area_unit')}
                      onBlur={() => setFocused('')}
                      style={{ ...inputStyle(focused === 'area_unit'), appearance: 'none', WebkitAppearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
                    >
                      {(Object.keys(AREA_UNIT_LABELS) as AreaUnit[]).map((u) => (
                        <option key={u} value={u}>{AREA_UNIT_LABELS[u]}</option>
                      ))}
                    </select>
                    <ChevronIcon />
                  </div>
                </div>
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
              </div>
            </div>
          </section>

          {/* ── Section 2: Classification ──────────────────────── */}
          <section>
            <SectionHeading>Classification</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

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
                      style={{ ...inputStyle(focused === 'property_type'), appearance: 'none', WebkitAppearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
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
                      style={{ ...inputStyle(focused === 'property_category'), appearance: 'none', WebkitAppearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
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

              <div>
                <label style={labelStyle}>Availability Status *</label>
                <div style={{ position: 'relative' }}>
                  <select
                    required
                    value={form.availability_status}
                    onChange={(e) => set('availability_status', e.target.value as AvailabilityStatus)}
                    onFocus={() => setFocused('availability_status')}
                    onBlur={() => setFocused('')}
                    style={{ ...inputStyle(focused === 'availability_status'), appearance: 'none', WebkitAppearance: 'none', paddingRight: '36px', cursor: 'pointer' }}
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

          {/* ── Section 3: Property Images ─────────────────────── */}
          <section>
            <SectionHeading>Property Images</SectionHeading>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
              aria-label="Upload property images"
            />

            {/* Upload trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              style={{
                width: '100%',
                border: '1px dashed #4d4637',
                backgroundColor: 'transparent',
                color: '#99907e',
                padding: '20px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                marginBottom: pendingImages.length > 0 ? '12px' : 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.25" />
                <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Choose Images
              </span>
              <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '11px', color: '#4d4637' }}>
                JPEG · PNG · WebP — multiple allowed
              </span>
            </button>

            {/* Image preview grid */}
            {pendingImages.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {pendingImages.map((img) => (
                  <div
                    key={img.id}
                    style={{
                      position: 'relative',
                      aspectRatio: '16/9',
                      backgroundColor: '#100e08',
                      border: `1px solid ${
                        img.status === 'done'
                          ? '#1D9E75'
                          : img.status === 'error'
                          ? '#8B2E2E'
                          : '#4d4637'
                      }`,
                      overflow: 'hidden',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.previewUrl}
                      alt={img.file.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />

                    {/* Uploading spinner overlay */}
                    {img.status === 'uploading' && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(16,14,8,0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ animation: 'spin 0.8s linear infinite', color: '#C9A84C' }} aria-hidden="true">
                          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="28 20" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}

                    {/* Done badge */}
                    {img.status === 'done' && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          backgroundColor: '#1D9E75',
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
                          <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}

                    {/* Error overlay */}
                    {img.status === 'error' && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(139,46,46,0.75)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-manrope)', fontSize: '9px', color: '#e9e1d7', textAlign: 'center', lineHeight: 1.4 }}>
                          {img.errorMsg ?? 'Upload failed'}
                        </span>
                      </div>
                    )}

                    {/* Remove button */}
                    {img.status !== 'uploading' && (
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        aria-label="Remove image"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '18px',
                          height: '18px',
                          backgroundColor: 'rgba(16,14,8,0.8)',
                          border: '1px solid #4d4637',
                          color: '#99907e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                          <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Section 4: Features & Amenities ───────────────── */}
          <section>
            <SectionHeading>Features &amp; Amenities</SectionHeading>

            <div style={{ marginBottom: '20px' }}>
              <ToggleRow
                checked={form.is_featured}
                onChange={(v) => set('is_featured', v)}
                label="Featured Listing"
                description="Highlights this property on the homepage"
              />
            </div>

            {amenities.length > 0 && (
              <div>
                <p style={{ ...labelStyle, marginBottom: '12px' }}>Amenities</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {amenities.map((amenity) => {
                    const checked = selectedAmenityIds.has(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
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
                          {amenity.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }} aria-hidden="true">
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
            type="button"
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
                {isEditMode ? 'Saving…' : 'Publishing…'}
              </>
            ) : (
              isEditMode ? 'Save Changes' : 'Publish Property'
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
        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: checked ? '#C9A84C' : '#d0c5b2', margin: '0 0 2px' }}>
          {label}
        </p>
        <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '11px', color: '#4d4637', margin: 0 }}>
          {description}
        </p>
      </div>
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
