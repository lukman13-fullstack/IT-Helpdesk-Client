import { notify } from "@/lib/toast";
import {
  getReferenceChecks,
  approveReferenceCheck,
  rejectReferenceCheck,
} from "@/services/api/referenceApprovals";
import type { ReferenceCheck } from "@/services/api/referenceApprovals";
import { ActionType } from "./reducer";

// Action Creators
export const setReferenceChecksActionCreator = (checks: ReferenceCheck[]) => ({
  type: ActionType.SET_REFERENCE_CHECKS,
  payload: checks,
});

export const setReferenceApprovalLoadingActionCreator = (loading: boolean) => ({
  type: ActionType.SET_REFERENCE_APPROVAL_LOADING,
  payload: loading,
});

export const setReferenceApprovalErrorActionCreator = (error: string | null) => ({
  type: ActionType.SET_REFERENCE_APPROVAL_ERROR,
  payload: error,
});

export const setReferenceApprovalPaginationActionCreator = (pagination: {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}) => ({
  type: ActionType.SET_REFERENCE_APPROVAL_PAGINATION,
  payload: pagination,
});

export const updateReferenceCheckStatusActionCreator = (
  id: number,
  status: "pending" | "approved" | "rejected"
) => ({
  type: ActionType.UPDATE_REFERENCE_CHECK_STATUS,
  payload: { id, status },
});

// Async Actions
export const asyncGetReferenceChecksActionCreator = (
  status: string = "pending",
  page: number = 1,
  limit: number = 10
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setReferenceApprovalLoadingActionCreator(true));
      const response = await getReferenceChecks(status, page, limit);
      dispatch(setReferenceChecksActionCreator(response.data));
      dispatch(setReferenceApprovalPaginationActionCreator(response.pagination));
    } catch (error: any) {
      console.error("Error fetching reference checks:", error);
      dispatch(setReferenceApprovalErrorActionCreator(error.message));
    } finally {
      dispatch(setReferenceApprovalLoadingActionCreator(false));
    }
  };
};

export const asyncApproveReferenceCheckActionCreator = (
  id: number,
  comments?: string
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setReferenceApprovalLoadingActionCreator(true));
      const response = await approveReferenceCheck(id, comments);
      if (response.success) {
        dispatch(updateReferenceCheckStatusActionCreator(id, "approved"));
        notify.success("Reference check approved successfully");
      }
      return response;
    } catch (error: any) {
      console.error("Error approving reference check:", error);
      notify.error(error.response?.data?.message || "Failed to approve reference check");
      throw error;
    } finally {
      dispatch(setReferenceApprovalLoadingActionCreator(false));
    }
  };
};

export const asyncRejectReferenceCheckActionCreator = (
  id: number,
  comments: string
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setReferenceApprovalLoadingActionCreator(true));
      const response = await rejectReferenceCheck(id, comments);
      if (response.success) {
        dispatch(updateReferenceCheckStatusActionCreator(id, "rejected"));
        notify.success("Reference check rejected");
      }
      return response;
    } catch (error: any) {
      console.error("Error rejecting reference check:", error);
      notify.error(error.response?.data?.message || "Failed to reject reference check");
      throw error;
    } finally {
      dispatch(setReferenceApprovalLoadingActionCreator(false));
    }
  };
};
