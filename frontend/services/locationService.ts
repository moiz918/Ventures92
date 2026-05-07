import { api } from './api';

export interface Location {
  id: string;
  city: string;
  region_or_society: string;
}

/**
 * Fetch all cities + societies for search dropdowns.
 * Backend returns them ordered for display.
 */
export async function getLocations(): Promise<Location[]> {
  return api.get<Location[]>('/locations/');
}
