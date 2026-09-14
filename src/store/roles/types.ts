import type {
  Role,
  Permission,
  Pagination,
} from "@/services/api/types/roles.types";

export interface RolesState {
  roles: Role[];
  roleDetail: Role | null;
  permissions: Permission[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
}

export interface RolesAction {
  type: string;
  payload?: any;
}
