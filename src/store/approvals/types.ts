import type { ApprovalRequest } from "@/services/api/types/documents.types";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApprovalsState {
  approvalRequests: ApprovalRequest[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

export interface ApprovalsAction {
  type: string;
  payload?: any;
}
