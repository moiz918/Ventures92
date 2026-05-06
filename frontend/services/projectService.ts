import { api } from './api';

// ── Enums ──────────────────────────────────────────────────────────────────────
export type ProjectStatus = 'PLANNED' | 'UNDER_CONSTRUCTION' | 'COMPLETED';

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
  /** 0–100; 100 = complete */
  completion_percentage: number;
  created_at: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  location_id?: string | null;
  /** Nested location object when returned by the API */
  location?: ProjectLocation | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  milestones: ProjectMilestone[];
}

// ── Service functions ──────────────────────────────────────────────────────────

/**
 * List all projects, optionally filtered by status.
 */
export async function getProjects(status?: ProjectStatus): Promise<Project[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  return api.get<Project[]>(`/projects/${qs}`);
}

/**
 * Fetch a single project by slug — includes milestones ordered by date.
 */
export async function getProjectBySlug(slug: string): Promise<ProjectDetail> {
  return api.get<ProjectDetail>(`/projects/${encodeURIComponent(slug)}`);
}
