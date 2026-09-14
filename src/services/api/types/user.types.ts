import type { ApiResponse } from "./common.types";

/**
 * User role structure from API
 */
export interface UserRole {
  id: number;
  name: string;
  description?: string;
  permissions: Array<{
    permission: {
      id: number;
      name: string;
      description?: string;
    };
  }>;
}

/**
 * Department structure in user response
 */
export interface UserDepartment {
  id: number;
  name: string;
  description: string;
}

/**
 * User profile data structure
 */
export interface ProfileData {
  id: number;
  username: string;
  fullName: string;
  email: string;
  position: string | null;
  role: UserRole;
  permissions: string[];
  departments: string[];
  departmentIds: number[];
}

/**
 * User structure from API (e.g., GET /users)
 */
export interface UserCreate {
  username: string;
  fullName: string;
  email: string;
  password: string;
  roleId: number | null;
  departmentId?: number | null;
  departmentIds?: number[];
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  position: string | null;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  departments: {
    department: UserDepartment;
  }[];
}
/**
 * API response type for user profile
 */
export type ProfileResponse = ApiResponse<ProfileData>;
