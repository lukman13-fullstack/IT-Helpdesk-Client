// ============================================================================
// Authentication Functions
// ============================================================================
export { login, getUserProfile, logout, changePassword } from "./auth";

// ============================================================================
// Departments Functions
// ============================================================================
export { getDepartments } from "./departments";

// ============================================================================
// Roles Functions
// ============================================================================
export {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
} from "./roles";

// ============================================================================
// Client Utilities
// ============================================================================
export {
  putAccessToken,
  getAccessToken,
  putRefreshToken,
  getRefreshToken,
  clearAccessToken,
  BASE_URL,
} from "./client";

// ============================================================================
// Type Exports
// ============================================================================
export type * from "./types";

// ============================================================================
// Default Export (for backward compatibility)
// ============================================================================
import * as authApi from "./auth";
import {
  putAccessToken,
  getAccessToken,
  putRefreshToken,
  getRefreshToken,
  clearAccessToken,
} from "./client";
import { getDepartments } from "./departments";



const api = {
  ...authApi,
  putAccessToken,
  getAccessToken,
  putRefreshToken,
  getRefreshToken,
  clearAccessToken,
  getDepartments,
};

export default api;
