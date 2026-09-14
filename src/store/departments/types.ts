import type {
  Department,
  DepartmentDetail,
} from "@/services/api/types/departements.types";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DepartmentsState {
  departments: Department[];
  departmentDetail: DepartmentDetail | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

export interface DepartmentsAction {
  type: string;
  payload?: any;
}
