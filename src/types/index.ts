// ── Re-export config types ─────────────────────────────────────
export type { Environment, UserRole, UserCredentials, EnvConfig } from '../../config/env.config';

// ── Auth ──────────────────────────────────────────────────────
export interface AuthState {
  token?:       string;
  storageState?: string;
}

// ── API ───────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data:    T;
  status:  number;
  message: string;
}

// ── Navigation ────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href:  string;
}
