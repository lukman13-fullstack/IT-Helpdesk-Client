import { notify } from "@/lib/toast";
import { setGlobalLoadingActionCreator, setLoadingProgressActionCreator } from "../ui/action";
import type {
  Document,
  DocumentDetail,
  GetDocumentsParams,
  CreateDocumentData,
  UpdateDocumentData,
  ReviseDocumentData,
  Pagination,
} from "@/services/api/types/documents.types";
import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  reviseDocument,
  downloadDocument,
  deleteDocument,
  togglePublishDocument,
  getObsoleteDocuments,
  getSharedDocuments,
  getDocumentHistory,
  migrateDocuments,
  toggleRawDownload,
} from "@/services/api/documents";

export const ActionType = {
  GET_DOCUMENTS: "GET_DOCUMENTS",
  GET_DOCUMENT: "GET_DOCUMENT",
  ADD_DOCUMENT: "ADD_DOCUMENT",
  UPDATE_DOCUMENT: "UPDATE_DOCUMENT",
  DELETE_DOCUMENT: "DELETE_DOCUMENT",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_OBSOLETE_DOCUMENTS: "SET_OBSOLETE_DOCUMENTS",
  SET_SHARED_DOCUMENTS: "SET_SHARED_DOCUMENTS",
  SET_DOCUMENT_HISTORY: "SET_DOCUMENT_HISTORY",
};

const getDocumentsActionCreator = (data: {
  documents: Document[];
  pagination: Pagination;
}) => {
  return {
    type: ActionType.GET_DOCUMENTS,
    payload: data,
  };
};

const getDocumentActionCreator = (data: DocumentDetail) => {
  return {
    type: ActionType.GET_DOCUMENT,
    payload: data,
  };
};

const addDocumentActionCreator = (document: Document) => {
  return {
    type: ActionType.ADD_DOCUMENT,
    payload: document,
  };
};

const updateDocumentActionCreator = (document: Document) => {
  return {
    type: ActionType.UPDATE_DOCUMENT,
    payload: document,
  };
};

const deleteDocumentActionCreator = (id: string | number) => {
  return {
    type: ActionType.DELETE_DOCUMENT,
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

const setObsoleteDocumentsActionCreator = (data: {
  documents: Document[];
  pagination: Pagination;
}) => {
  return {
    type: ActionType.SET_OBSOLETE_DOCUMENTS,
    payload: data,
  };
};

const setSharedDocumentsActionCreator = (data: {
  documents: Document[];
  pagination: Pagination;
}) => {
  return {
    type: ActionType.SET_SHARED_DOCUMENTS,
    payload: data,
  };
};

const setDocumentHistoryActionCreator = (data: any[]) => {
  return {
    type: ActionType.SET_DOCUMENT_HISTORY,
    payload: data,
  };
};

export const asyncGetDocumentsActionCreator = (
  params: GetDocumentsParams = {}
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getDocuments(params);
      dispatch(getDocumentsActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get documents");
    }
  };
};

export const asyncGetDocumentByIdActionCreator = (id: string | number) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getDocumentById(id);
      dispatch(getDocumentActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get document");
    }
  };
};

export const asyncCreateDocumentActionCreator = (data: CreateDocumentData) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));
      dispatch(setLoadingProgressActionCreator(0));
      
      const response = await createDocument(data, (progressEvent) => {
        if (progressEvent.total) {
          let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Cap progress at 95% while waiting for server processing
          if (percentCompleted >= 100) {
            percentCompleted = 95;
          }
          dispatch(setLoadingProgressActionCreator(percentCompleted));
        }
      });

      if (response.success) {
        // Explicitly set to 100% when backend process finishes successfully
        dispatch(setLoadingProgressActionCreator(100));
        notify.success(response.message || "Document created successfully");
        dispatch(addDocumentActionCreator(response.data));
        return response;
      } else {
        throw new Error(response.message || "Failed to create document");
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to create document");
      throw error;
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
      dispatch(setLoadingProgressActionCreator(null));
    }
  };
};

export const asyncMigrateDocumentsActionCreator = (data: FormData) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));
      dispatch(setLoadingProgressActionCreator(0));

      const response = await migrateDocuments(data, (progressEvent) => {
        if (progressEvent.total) {
          let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Cap progress at 95% while waiting for server processing
          if (percentCompleted >= 100) {
            percentCompleted = 95;
          }
          dispatch(setLoadingProgressActionCreator(percentCompleted));
        }
      });
      // Explicitly set to 100% when backend process finishes successfully
      dispatch(setLoadingProgressActionCreator(100));
      notify.success("Documents migrated successfully");
      return response;
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to migrate documents");
      throw error;
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
      dispatch(setLoadingProgressActionCreator(null));
    }
  };
};

export const asyncUpdateDocumentActionCreator = (
  id: string | number,
  data: UpdateDocumentData
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));
      dispatch(setLoadingProgressActionCreator(0));
      
      const response = await updateDocument(id, data, (progressEvent) => {
        if (progressEvent.total) {
          let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (percentCompleted >= 100) percentCompleted = 95;
          dispatch(setLoadingProgressActionCreator(percentCompleted));
        }
      });

      if (response.success) {
        dispatch(setLoadingProgressActionCreator(100));
        notify.success(response.message || "Document updated successfully");
        dispatch(updateDocumentActionCreator(response.data));
        return response;
      } else {
        throw new Error(response.message || "Failed to update document");
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to update document");
      throw error;
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
      dispatch(setLoadingProgressActionCreator(null));
    }
  };
};

export const asyncReviseDocumentActionCreator = (
  id: string | number,
  data: ReviseDocumentData
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));
      dispatch(setLoadingProgressActionCreator(0));

      const response = await reviseDocument(id, data, (progressEvent) => {
        if (progressEvent.total) {
          let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (percentCompleted >= 100) percentCompleted = 95;
          dispatch(setLoadingProgressActionCreator(percentCompleted));
        }
      });

      if (response.success) {
        dispatch(setLoadingProgressActionCreator(100));
        notify.success(response.message || "Document revised successfully");
        dispatch(updateDocumentActionCreator(response.data));
        return response;
      } else {
        throw new Error(response.message || "Failed to revise document");
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to revise document");
      throw error;
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
      dispatch(setLoadingProgressActionCreator(null));
    }
  };
};

export const asyncDownloadDocumentActionCreator = (
  id: string | number,
  name: string
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));
      const { blob, filename } = await downloadDocument(id, name);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notify.success("Document downloaded successfully");
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to download document");
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
    }
  };
};

export const asyncDeleteDocumentActionCreator = (
  id: string | number,
  reason?: string
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));
      const response = await deleteDocument(id, reason);
      const json = await response.json();

      if (response.status === 200) {
        notify.success(json.message || "Document deleted successfully");

        // Only remove from store if it was actually deleted, not just a request submitted
        if (!json.message?.includes("Deletion request submitted")) {
          dispatch(deleteDocumentActionCreator(id));
        }
      } else {
        notify.error(json.message || "Failed to delete document");
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to delete document");
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
    }
  };
};


export const asyncTogglePublishDocumentActionCreator = (
  id: string | number,
  isPublished: boolean
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));
      const response = await togglePublishDocument(id, isPublished);

      if (response.success) {
        notify.success(response.message || "Document publish status updated");
        dispatch(updateDocumentActionCreator(response.data));
        return response;
      } else {
        throw new Error(
          response.message || "Failed to update document publish status"
        );
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to update document publish status");
      throw error;
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
    }
  };
};

export const asyncToggleRawDownloadActionCreator = (
  id: string | number,
  isRawDownloadable: boolean
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setGlobalLoadingActionCreator(true));
      const response = await toggleRawDownload(id, isRawDownloadable);

      if (response.success) {
        notify.success(response.message || "Raw download setting updated");
        dispatch(updateDocumentActionCreator(response.data));
        return response;
      } else {
        throw new Error(
          response.message || "Failed to update raw download setting"
        );
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to update raw download setting");
      throw error;
    } finally {
      dispatch(setGlobalLoadingActionCreator(false));
    }
  };
};

export const asyncGetObsoleteDocumentsActionCreator = (
  params: GetDocumentsParams = {}
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getObsoleteDocuments(params);
      dispatch(setObsoleteDocumentsActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get obsolete documents");
    }
  };
};

export const asyncGetSharedDocumentsActionCreator = (
  departmentId: string | number,
  page: number,
  limit: number,
  search?: string,
  category?: string
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getSharedDocuments(
        page,
        limit,
        departmentId,
        search,
        category
      );
      dispatch(setSharedDocumentsActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get shared documents");
    }
  };
};

export const asyncGetDocumentHistoryActionCreator = (id: string | number) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getDocumentHistory(id);
      dispatch(setDocumentHistoryActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get document history");
    }
  };
};
