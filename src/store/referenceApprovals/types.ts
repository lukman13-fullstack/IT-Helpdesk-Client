import type { ReferenceCheck } from "@/services/api/referenceApprovals";

export interface ReferenceApprovalState {
  referenceChecks: ReferenceCheck[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const SET_REFERENCE_CHECKS = "SET_REFERENCE_CHECKS";
export const SET_REFERENCE_APPROVAL_LOADING = "SET_REFERENCE_APPROVAL_LOADING";
export const SET_REFERENCE_APPROVAL_ERROR = "SET_REFERENCE_APPROVAL_ERROR";
export const SET_REFERENCE_APPROVAL_PAGINATION = "SET_REFERENCE_APPROVAL_PAGINATION";
export const UPDATE_REFERENCE_CHECK_STATUS = "UPDATE_REFERENCE_CHECK_STATUS";

interface SetReferenceChecksAction {
  type: typeof SET_REFERENCE_CHECKS;
  payload: ReferenceCheck[];
}

interface SetReferenceApprovalLoadingAction {
  type: typeof SET_REFERENCE_APPROVAL_LOADING;
  payload: boolean;
}

interface SetReferenceApprovalErrorAction {
  type: typeof SET_REFERENCE_APPROVAL_ERROR;
  payload: string | null;
}

interface SetReferenceApprovalPaginationAction {
  type: typeof SET_REFERENCE_APPROVAL_PAGINATION;
  payload: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UpdateReferenceCheckStatusAction {
  type: typeof UPDATE_REFERENCE_CHECK_STATUS;
  payload: {
    id: number;
    status: "pending" | "approved" | "rejected";
  };
}

export type ReferenceApprovalAction =
  | SetReferenceChecksAction
  | SetReferenceApprovalLoadingAction
  | SetReferenceApprovalErrorAction
  | SetReferenceApprovalPaginationAction
  | UpdateReferenceCheckStatusAction;
