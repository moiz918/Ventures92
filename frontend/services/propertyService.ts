import { api } from './api';

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
