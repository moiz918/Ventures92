/**
 * Authentication service — talks to /api/v1/auth/* endpoints.
 *
 * All methods rely on the HttpOnly cookies set by the backend.
 * - login()          — issues access + refresh cookies
 * - logout()         — clears cookies
 * - me()             — returns the current authenticated user
 * - refresh()        — exchanges the refresh cookie for a new access cookie
 * - forgotPassword() — kicks off the reset flow (always 200)
 * - resetPassword()  — completes the reset using the token from the email link
 */
import { api } from './api';

// ── Types ───────────────────────────────────────────────────────────────────
export type UserRole = 'SUPER_ADMIN' | 'AGENT' | 'INVESTOR' | 'BUYER_TENANT';

export interface CurrentUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role: UserRole;
  is_active: boolean;
  last_login_at: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: CurrentUser;
  expires_in: number;
}

export interface MessageResponse {
  message: string;
}

// ── Calls ───────────────────────────────────────────────────────────────────
export function login(payload: LoginPayload) {
  return api.post<LoginResponse>('/auth/login', payload);
}

export function logout() {
  return api.post<MessageResponse>('/auth/logout', {});
}

export function me(headers?: HeadersInit) {
  return api.get<CurrentUser>('/auth/me', { headers });
}

export function refresh(headers?: HeadersInit) {
  return api.post<MessageResponse>('/auth/refresh', {}, { headers });
}

export function forgotPassword(email: string) {
  return api.post<MessageResponse>('/auth/forgot-password', { email });
}

export function resetPassword(token: string, newPassword: string) {
  return api.post<MessageResponse>('/auth/reset-password', {
    token,
    new_password: newPassword,
  });
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export function changePassword(payload: ChangePasswordPayload) {
  return api.post<MessageResponse>('/auth/change-password', payload);
}

// ── Helpers ─────────────────────────────────────────────────────────────────
export const ADMIN_ROLES: ReadonlySet<UserRole> = new Set(['SUPER_ADMIN', 'AGENT']);

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return !!role && ADMIN_ROLES.has(role);
}

// ── Signup ───────────────────────────────────────────────────────────────────
export type PublicSignupRole = 'INVESTOR' | 'BUYER_TENANT';

export interface SignupPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: PublicSignupRole;
}

export interface SignupResponse {
  user: CurrentUser;
  expires_in: number;
}

export function signup(payload: SignupPayload) {
  return api.post<SignupResponse>('/auth/signup', payload);
}
