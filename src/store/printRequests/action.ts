import { notify } from "@/lib/toast";
import { setGlobalLoadingActionCreator } from "../ui/action";
import type { Pagination } from "@/services/api/types/documents.types";
import {
  getPrintRequests,
  getPrintHistory,
  getAllPrintHistory,
  getPrintRequestById,
  requestPrint,
} from "@/services/api/documents";

export const ActionType = {
  GET_PRINT_REQUESTS: "GET_PRINT_REQUESTS",
  GET_PRINT_HISTORY: "GET_PRINT_HISTORY",
  GET_ALL_PRINT_HISTORY: "GET_ALL_PRINT_HISTORY",
  GET_PRINT_DETAIL: "GET_PRINT_DETAIL",
  ADD_PRINT_HISTORY: "ADD_PRINT_HISTORY",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
};

const addPrintHistoryActionCreator = (printRequest: any) => {
  return {
    type: ActionType.ADD_PRINT_HISTORY,
    payload: printRequest,
  };
};

const getPrintRequestsActionCreator = (data: {
  requests: any[];
  pagination: Pagination;
}) => {
  return {
    type: ActionType.GET_PRINT_REQUESTS,
    payload: data,
  };
};

const getPrintHistoryActionCreator = (data: {
  requests: any[];
  pagination: Pagination;
}) => {
  return {
    type: ActionType.GET_PRINT_HISTORY,
    payload: data,
  };
};

const getAllPrintHistoryActionCreator = (data: {
  requests: any[];
  pagination: Pagination;
}) => {
  return {
    type: ActionType.GET_ALL_PRINT_HISTORY,
    payload: data,
  };
};

const getPrintDetailActionCreator = (printRequest: any) => {
  return {
    type: ActionType.GET_PRINT_DETAIL,
    payload: printRequest,
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

// Get all print requests (for approvals page - QA only)
export const asyncGetPrintRequestsActionCreator = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getPrintRequests(params);
      dispatch(
        getPrintRequestsActionCreator({
          requests: response.approvals,
          pagination: response.pagination,
        })
      );
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get print requests");
    } finally {
      dispatch(setLoadingActionCreator(false));
    }
  };
};

// Get print history for a specific document (from print_request table)
export const asyncGetPrintHistoryActionCreator = (documentId: number) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getPrintHistory(documentId, { limit: 100 });
      dispatch(getPrintHistoryActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get print history");
    } finally {
      dispatch(setLoadingActionCreator(false));
    }
  };
};

// Request print for a document
export const asyncRequestPrintActionCreator = (
  id: string | number,
  data: {
    reason: string;
    copies: number;
    storageLocation: string;
    isInternal: boolean;
  }
) => {
  return async (dispatch: any, getState: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));
      const response = await requestPrint(id, data);

      if (response.success) {
        notify.success(response.message || "Print request sent successfully");

        // Optimistic update: add new print request to history
        if (response.data) {
          const { user } = getState().authUser;
          const newPrintRequest = {
            ...response.data,
            requester: {
              id: user?.id,
              fullName: user?.fullName || user?.username,
              email: user?.email,
            },
          };
          dispatch(addPrintHistoryActionCreator(newPrintRequest));
        }

        return response;
      } else {
        throw new Error(response.message || "Failed to request print");
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to request print");
      throw error;
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
    }
  };
};

// Bulk request print for multiple documents
export const asyncBulkRequestPrintActionCreator = (data: {
  documentIds: number[];
  reason: string;
  copies: number;
  storageLocation: string;
  distribution: "Internal" | "External";
}) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));
      const { bulkRequestPrint } = await import("@/services/api/documents");
      const response = await bulkRequestPrint(data);

      if (response.success) {
        notify.success(response.message || "Bulk print request sent successfully");
        return response;
      } else {
        throw new Error(response.message || "Failed to process bulk print request");
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to process bulk print request");
      throw error;
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
    }
  };
};
// Get all print history across all documents
export const asyncGetAllPrintHistoryActionCreator = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  status?: string;
  distribution?: string;
}) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getAllPrintHistory(params);
      dispatch(getAllPrintHistoryActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get print history");
    } finally {
      dispatch(setLoadingActionCreator(false));
    }
  };
};

// Get specific print request detail
export const asyncGetPrintDetailActionCreator = (id: string | number) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));
      const response = await getPrintRequestById(id);
      dispatch(getPrintDetailActionCreator(response));
    } catch (error: any) {
      notify.error("Failed to get print request details");
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
    }
  };
};
