import { notify } from "@/lib/toast";
import { setGlobalLoadingActionCreator } from "../ui/action";
import type {
  ApprovalRequest,
  ApprovalStatus,
  ApprovalActionData,
  Pagination,
} from "@/services/api/types/documents.types";
import {
  getApprovalRequests,
  approveDocument,
  rejectDocument,
  approveBatchDocuments
} from "@/services/api/approvals";
import {
  approvePrintRequest,
  rejectPrintRequest,
} from "@/services/api/documents";

export const ActionType = {
  GET_APPROVAL_REQUESTS: "GET_APPROVAL_REQUESTS",
  REMOVE_APPROVAL_REQUEST: "REMOVE_APPROVAL_REQUEST",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
};

const getApprovalRequestsActionCreator = (data: {
  approvals: ApprovalRequest[];
  pagination: Pagination;
}) => {
  return {
    type: ActionType.GET_APPROVAL_REQUESTS,
    payload: data,
  };
};

const removeApprovalRequestActionCreator = (id: string | number) => {
  return {
    type: ActionType.REMOVE_APPROVAL_REQUEST,
    payload: id,
  };
};

const setLoadingActionCreator = (loading: boolean) => {
  return {
    type: ActionType.SET_LOADING,
    payload: loading,
  };
};

const setErrorActionCreator = (error: string | null) => {
  return {
    type: ActionType.SET_ERROR,
    payload: error,
  };
};

export const asyncGetApprovalRequestsActionCreator = (
  statusOrOptions?: ApprovalStatus | { silent?: boolean },
  page: number = 1,
  limit: number = 1000
) => {
  return async (dispatch: any) => {
    try {
      // Handle first parameter as either status or options object
      let status: ApprovalStatus = "all"; // Default to "all" to show history

      let isSilent = false;

      if (
        typeof statusOrOptions === "object" &&
        statusOrOptions !== null &&
        "silent" in statusOrOptions
      ) {
        // Silent mode - use default "all" status
        status = "all";
        isSilent = true;
      } else if (statusOrOptions) {
        // Use provided status
        status = statusOrOptions as ApprovalStatus;
      }

      if (!isSilent) {
        dispatch(setLoadingActionCreator(true));
      }
      
      const response = await getApprovalRequests(status, page, limit);
      dispatch(getApprovalRequestsActionCreator(response));
    } catch (error: any) {
      // Silently fail on 401 (Unauthorized) or if silent mode
      const isUnauthorized =
        error.status === 401 ||
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized");
      const isSilent =
        typeof statusOrOptions === "object" &&
        statusOrOptions !== null &&
        "silent" in statusOrOptions &&
        statusOrOptions.silent;

      if (!isUnauthorized && !isSilent) {
        notify.error("Failed to get approval requests");
      }

      dispatch(setErrorActionCreator(error.message));
    } finally {
      dispatch(setLoadingActionCreator(false));
    }
  };
};

export const asyncApproveDocumentActionCreator = (
  approvalId: string | number,
  data: ApprovalActionData = {},
  isPrintRequest: boolean = false
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));

      let response;
      if (isPrintRequest) {
        response = await approvePrintRequest(approvalId);
      } else {
        response = await approveDocument(approvalId, data);
      }

      if (response.success) {
        notify.success(response.message || "Approved successfully");
        // Refresh the approval requests list to get updated canAct flags
        dispatch(asyncGetApprovalRequestsActionCreator());
        return response;
      } else {
        throw new Error(response.message || "Failed to approve");
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to approve");
      throw error;
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
    }
  };
};

export const asyncApproveBatchDocumentsActionCreator = (
  approvalIds: (string | number)[],
  data: ApprovalActionData = {}
) => {
  return async (dispatch: any) => {
    try {
      if (approvalIds.length === 0) return;
      
      dispatch(setGlobalLoadingActionCreator(true));

      // Execute batch approval via new dedicated backend endpoint
      const response = await approveBatchDocuments(approvalIds, data);
      
      const successful = response.data?.successful || 0;
      const failed = response.data?.failed || 0;

      if (response.success) {
        if (failed === 0) {
           notify.success(`Successfully approved ${successful} migrated documents.`);
        } else if (successful > 0) {
           notify.warning(`Approved ${successful} documents, but ${failed} failed.`);
        } else {
           notify.error("Failed to approve any documents in the batch.");
        }
      } else {
        notify.error(response.message || "Failed to batch approve documents.");
      }

      // Refresh the approval requests list
      dispatch(asyncGetApprovalRequestsActionCreator());
      return { successful, failed };
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to batch approve");
      throw error;
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
    }
  };
};

export const asyncRejectDocumentActionCreator = (
  approvalId: string | number,
  data: ApprovalActionData,
  isPrintRequest: boolean = false
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));

      let response;
      if (isPrintRequest) {
        response = await rejectPrintRequest(
          approvalId,
          data.comments || "Rejected"
        );
      } else {
        response = await rejectDocument(approvalId, data);
      }

      if (response.success) {
        notify.success(response.message || "Rejected successfully");
        dispatch(removeApprovalRequestActionCreator(approvalId));
        return response;
      } else {
        throw new Error(response.message || "Failed to reject");
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to reject");
      throw error;
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
    }
  };
};
