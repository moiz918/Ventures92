import { api } from './api';

export type LeadPropertyType = 'RESIDENTIAL' | 'COMMERCIAL';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'QUALIFIED' | 'LOST' | 'CLOSED';

// ── Request payloads ──────────────────────────────────────────────────────────
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

// ── Response types ────────────────────────────────────────────────────────────
export interface LeadResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  preferred_property_type: LeadPropertyType;
  min_budget?: string | null;
  max_budget?: string | null;
  message?: string | null;
  status: LeadStatus;
  assigned_agent_id?: string | null;
  created_at: string;
  updated_at: string;
}

// ── Service functions ─────────────────────────────────────────────────────────
export async function submitLead(data: LeadCreatePayload): Promise<void> {
  await api.post<unknown>('/leads/', data);
}

export async function getLeads(): Promise<LeadResponse[]> {
  return api.get<LeadResponse[]>('/leads/');
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<LeadResponse> {
  return api.put<LeadResponse>(`/leads/${id}/status`, { status });
}
