import { notify } from "@/lib/toast";
import type { DocumentReference } from "@/services/api/references";
import {
  getReferences,
  getAllActiveReferences,
  getReferenceById,
  createReference,
  updateReference,
  deleteReference,
  type CreateReferenceData,
  type UpdateReferenceData,
} from "@/services/api/references";
import type { Pagination } from "./types";

export const ActionType = {
  GET_REFERENCES: "GET_REFERENCES",
  GET_REFERENCE: "GET_REFERENCE",
  GET_ALL_REFERENCES: "GET_ALL_REFERENCES",
  ADD_REFERENCE: "ADD_REFERENCE",
  UPDATE_REFERENCE: "UPDATE_REFERENCE",
  DELETE_REFERENCE: "DELETE_REFERENCE",
  SET_LOADING: "SET_REFERENCES_LOADING",
  SET_ERROR: "SET_REFERENCES_ERROR",
};

const getReferencesActionCreator = (data: {
  references: DocumentReference[];
  pagination?: Pagination;
}) => {
  return {
    type: ActionType.GET_REFERENCES,
    payload: data,
  };
};

const getReferenceActionCreator = (data: DocumentReference) => {
  return {
    type: ActionType.GET_REFERENCE,
    payload: data,
  };
};

const getAllReferencesActionCreator = (data: DocumentReference[]) => {
  return {
    type: ActionType.GET_ALL_REFERENCES,
    payload: data,
  };
};

const addReferenceActionCreator = (reference: DocumentReference) => {
  return {
    type: ActionType.ADD_REFERENCE,
    payload: reference,
  };
};

const updateReferenceActionCreator = (reference: DocumentReference) => {
  return {
    type: ActionType.UPDATE_REFERENCE,
    payload: reference,
  };
};

const deleteReferenceActionCreator = (id: number) => {
  return {
    type: ActionType.DELETE_REFERENCE,
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

export const asyncGetReferencesActionCreator = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getReferences({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || "",
      });
      dispatch(getReferencesActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get references");
    }
  };
};

export const asyncGetAllReferencesActionCreator = () => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getAllActiveReferences();
      dispatch(getAllReferencesActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get references");
    }
  };
};

export const asyncGetReferenceByIdActionCreator = (id: number | string) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getReferenceById(id);
      dispatch(getReferenceActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get reference");
    }
  };
};

export const asyncCreateReferenceActionCreator = (data: CreateReferenceData) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await createReference(data);
      notify.success("Reference created successfully");
      dispatch(addReferenceActionCreator(response));
      return response;
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to create reference");
      throw error;
    }
  };
};

export const asyncUpdateReferenceActionCreator = (
  id: number | string,
  data: UpdateReferenceData
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await updateReference(id, data);
      notify.success("Reference updated successfully");
      dispatch(updateReferenceActionCreator(response));
      return response;
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to update reference");
      throw error;
    }
  };
};

export const asyncDeleteReferenceActionCreator = (id: number) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      await deleteReference(id);
      notify.success("Reference deleted successfully");
      dispatch(deleteReferenceActionCreator(id));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to delete reference");
      throw error;
    }
  };
};
