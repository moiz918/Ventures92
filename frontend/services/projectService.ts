import { api } from './api';

// ── Enums ──────────────────────────────────────────────────────────────────────
// Must match backend app.models.enums.ProjectStatus exactly.
export type ProjectStatus = 'PLANNING' | 'UNDER_CONSTRUCTION' | 'COMPLETED';

// ── Core entities ──────────────────────────────────────────────────────────────
export interface ProjectLocation {
  id: string;
  city: string;
  region_or_society: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  /** ISO date string e.g. "2025-03-15" */
  milestone_date: string;
  /** 0–100 when set; null when not yet recorded */
  completion_percentage: number | null;
  created_at: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  location_id?: string | null;
  /** Nested location object — present in list and detail responses */
  location?: ProjectLocation | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  milestones: ProjectMilestone[];
}

// ── Service functions ──────────────────────────────────────────────────────────

export async function getProjects(status?: ProjectStatus): Promise<Project[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return api.get<Project[]>(`/projects/${qs}`);
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail> {
  return api.get<ProjectDetail>(`/projects/${encodeURIComponent(slug)}`);
}
