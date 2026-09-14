import type { ApiResponse } from "./common.types";
import type { UserRole } from "./user.types";

// ============================================================================
// Request Types
// ============================================================================

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Refresh token request payload
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Change password request payload
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// ============================================================================
// Response Data Types
// ============================================================================

/**
 * Login response data including user info and tokens
 */
export interface LoginData {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  permissions: string[];
  departments: string[];
  departmentIds: number[];
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh token response data
 */
export interface RefreshTokenData {
  accessToken: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * API response type for login
 */
export type LoginResponse = ApiResponse<LoginData>;

/**
 * API response type for token refresh
 */
export type RefreshTokenResponse = ApiResponse<RefreshTokenData>;

/**
 * API response type for logout
 */
export type LogoutResponse = ApiResponse<null>;

/**
 * API response type for password change
 */
export type ChangePasswordResponse = ApiResponse<null>;
