import { api } from './api';

export interface Partner {
  id: string;
  name: string;
  logo_url?: string | null;
  website_url?: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch active corporate partners ordered by display_order.
 * Backend filters to is_active=true automatically.
 */
export async function getPartners(): Promise<Partner[]> {
  return api.get<Partner[]>('/partners/');
}
