import { api } from './api';

export type LeadPropertyType = 'RESIDENTIAL' | 'COMMERCIAL';

export interface LeadCreatePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  preferred_property_type: LeadPropertyType;
  min_budget?: string;
  max_budget?: string;
  message?: string;
}

export async function submitLead(data: LeadCreatePayload): Promise<void> {
  await api.post<unknown>('/leads/', data);
}
