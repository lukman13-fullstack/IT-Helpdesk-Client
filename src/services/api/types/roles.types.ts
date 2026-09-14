import type { ApiResponse } from "./common.types";

/**
 * Permission structure from API
 */
export interface Permission {
  id: number;
  name: string;
  displayName: string;
  description?: string;
}

/**
 * Permission with usage count
 */
export interface PermissionWithCount extends Permission {
  _count?: {
    roles: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User basic info in role response
 */
export interface RoleUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
}

/**
 * Role structure from API
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
  users?: RoleUser[];
  _count?: {
    users: number;
    permissions: number;
  };
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Roles list response from API
 */
export interface RolesListData {
  roles: Role[];
  pagination: Pagination;
}

/**
 * Single role response from API
 */
export type RoleResponse = ApiResponse<Role>;

/**
 * Roles list response from API
 */
export type RolesListResponse = ApiResponse<RolesListData>;

/**
 * Permissions list response from API
 */
export type PermissionsResponse = ApiResponse<Permission[]>;

/**
 * Permissions list with pagination response from API
 */
export interface PermissionsListData {
  permissions: PermissionWithCount[];
  pagination: Pagination;
}

export type PermissionsListResponse = ApiResponse<PermissionsListData>;

/**
 * Create role payload
 */
export interface RoleCreate {
  name: string;
  description?: string;
  permissionIds?: number[];
}

/**
 * Update role payload
 */
export interface RoleUpdate {
  name?: string;
  description?: string;
  permissionIds?: number[];
}
