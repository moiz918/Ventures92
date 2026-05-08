import { api, ApiError } from './api';

// ── Enums ──────────────────────────────────────────────────────────────────
export type PropertyType = 'RESIDENTIAL' | 'COMMERCIAL';
export type PropertyCategory = 'PLOT' | 'HOUSE' | 'APARTMENT' | 'OFFICE' | 'SHOP';
export type AvailabilityStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';
export type AreaUnit = 'SQ_FT' | 'SQ_YARD' | 'MARLA' | 'KANAL';

// ── Core entities ──────────────────────────────────────────────────────────
export interface PropertyMedia {
  id: string;
  property_id: string;
  media_url: string;
  media_type: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Amenity {
  id: string;
  name: string;
  /** Identifier for an icon (e.g. "pool", "gym") — used for SVG/icon lookup */
  icon_name?: string | null;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  property_type: PropertyType;
  property_category: PropertyCategory;
  /** Decimal string from backend — use as-is to avoid float precision loss */
  price: string;
  /** Decimal string e.g. "2400.00" */
  area_size: string;
  area_unit: AreaUnit;
  bedrooms?: number | null;
  bathrooms?: number | null;
  address_details?: string | null;
  availability_status: AvailabilityStatus;
  is_featured: boolean;
  project_id?: string | null;
  created_at: string;
  updated_at: string;
  /**
   * Present when the backend eager-loads media (list endpoint + detail endpoint).
   * May be absent on older cached responses — always treat as optional.
   */
  media?: PropertyMedia[];
}

export interface PropertyDetail extends Property {
  media: PropertyMedia[];
  amenities: Amenity[];
}

// ── Query params ───────────────────────────────────────────────────────────
export interface PropertyListParams {
  property_type?: PropertyType;
  property_category?: PropertyCategory;
  /** UUID of a Location — filters via projects.location_id */
  location_id?: string;
  /** Inclusive lower price bound (Decimal string) */
  min_price?: string;
  /** Inclusive upper price bound (Decimal string) */
  max_price?: string;
  availability_status?: AvailabilityStatus;
  is_featured?: boolean;
  /** Default 20, max 100 */
  limit?: number;
  offset?: number;
}

// ── Service functions ──────────────────────────────────────────────────────

export async function getProperties(params?: PropertyListParams): Promise<Property[]> {
  const qs = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        qs.set(key, String(value));
      }
    }
  }
  const query = qs.size > 0 ? `?${qs.toString()}` : '';
  return api.get<Property[]>(`/properties/${query}`);
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDetail> {
  return api.get<PropertyDetail>(`/properties/${encodeURIComponent(slug)}`);
}

export async function getAmenities(): Promise<Amenity[]> {
  return api.get<Amenity[]>('/amenities/');
}

// ── Admin mutations ────────────────────────────────────────────────────────

export interface PropertyCreatePayload {
  title: string;
  /** Auto-generated server-side if omitted */
  slug?: string;
  description?: string;
  property_type: PropertyType;
  property_category: PropertyCategory;
  /** Decimal string — e.g. "7500000" */
  price: string;
  /** Decimal string e.g. "2400" */
  area_size: string;
  area_unit: AreaUnit;
  bedrooms?: number;
  bathrooms?: number;
  address_details?: string;
  availability_status: AvailabilityStatus;
  is_featured: boolean;
  project_id?: string;
  /** UUIDs from GET /amenities/ */
  amenity_ids?: string[];
}

export async function createProperty(data: PropertyCreatePayload): Promise<Property> {
  return api.post<Property>('/properties/', data);
}

export async function deleteProperty(id: string): Promise<void> {
  await api.delete<unknown>(`/properties/${id}`);
}

// ── Update (partial) ───────────────────────────────────────────────────────

export interface PropertyUpdatePayload {
  title?: string;
  description?: string;
  property_type?: PropertyType;
  property_category?: PropertyCategory;
  /** Decimal string — e.g. "7500000" */
  price?: string;
  /** Decimal string e.g. "2400" */
  area_size?: string;
  area_unit?: AreaUnit;
  bedrooms?: number;
  bathrooms?: number;
  address_details?: string;
  availability_status?: AvailabilityStatus;
  is_featured?: boolean;
  /** UUIDs from GET /amenities/ — replaces existing M2M set */
  amenity_ids?: string[];
}

export async function updateProperty(id: string, data: PropertyUpdatePayload): Promise<Property> {
  return api.put<Property>(`/properties/${id}`, data);
}

// ── Media upload ───────────────────────────────────────────────────────────

export interface MediaUploadResponse {
  url: string;
  filename: string;
  content_type: string;
  size_bytes: number;
}

/**
 * Uploads a single image file to POST /api/v1/media/upload using multipart
 * form-data. The Content-Type header is intentionally omitted so the browser
 * sets the correct boundary automatically. Always client-side only.
 */
export async function uploadPropertyMedia(file: File): Promise<MediaUploadResponse> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${base}/media/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // No Content-Type header — browser fills in the multipart boundary automatically
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
      // ignore json parse errors on error responses
    }
    throw new ApiError(res.status, res.statusText, detail);
  }

  return res.json() as Promise<MediaUploadResponse>;
}
