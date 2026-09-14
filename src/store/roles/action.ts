import { notify } from "@/lib/toast";
import type {
  Role,
  Permission,
  Pagination,
  RoleCreate,
  RoleUpdate,
} from "@/services/api/types/roles.types";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
} from "@/services/api/roles";

export const ActionType = {
  GET_ROLES: "GET_ROLES",
  GET_ROLE: "GET_ROLE",
  GET_PERMISSIONS: "GET_PERMISSIONS",
  ADD_ROLE: "ADD_ROLE",
  UPDATE_ROLE: "UPDATE_ROLE",
  DELETE_ROLE: "DELETE_ROLE",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
};

const getRolesActionCreator = (data: {
  roles: Role[];
  pagination: Pagination;
}) => {
  return {
    type: ActionType.GET_ROLES,
    payload: data,
  };
};

const getRoleActionCreator = (data: Role) => {
  return {
    type: ActionType.GET_ROLE,
    payload: data,
  };
};

const getPermissionsActionCreator = (data: Permission[]) => {
  return {
    type: ActionType.GET_PERMISSIONS,
    payload: data,
  };
};

const addRoleActionCreator = (role: Role) => {
  return {
    type: ActionType.ADD_ROLE,
    payload: role,
  };
};

const updateRoleActionCreator = (role: Role) => {
  return {
    type: ActionType.UPDATE_ROLE,
    payload: role,
  };
};

const deleteRoleActionCreator = (id: string | number) => {
  return {
    type: ActionType.DELETE_ROLE,
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

export const asyncGetRolesActionCreator = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getRoles(
        params.page || 1,
        params.limit || 10,
        params.search || ""
      );
      dispatch(getRolesActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get roles");
    }
  };
};

export const asyncGetRoleByIdActionCreator = (id: string | number) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getRoleById(id);
      dispatch(getRoleActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get role");
    }
  };
};

export const asyncGetAllPermissionsActionCreator = () => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await getAllPermissions();
      dispatch(getPermissionsActionCreator(response));
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error("Failed to get permissions");
    }
  };
};

export const asyncCreateRoleActionCreator = (data: RoleCreate) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await createRole(data);

      if (response.status === "success") {
        notify.success(response.message || "Role created successfully");
        dispatch(addRoleActionCreator(response.data));
        return response;
      } else {
        throw new Error(response.message || "Failed to create role");
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to create role");
      throw error;
    }
  };
};

export const asyncUpdateRoleActionCreator = (
  id: string | number,
  data: RoleUpdate
) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await updateRole(id, data);

      if (response.status === "success") {
        notify.success(response.message || "Role updated successfully");
        dispatch(updateRoleActionCreator(response.data));
        return response;
      } else {
        throw new Error(response.message || "Failed to update role");
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to update role");
      throw error;
    }
  };
};

export const asyncDeleteRoleActionCreator = (id: string | number) => {
  return async (dispatch: any) => {
    try {
      dispatch(setLoadingActionCreator(true));
      const response = await deleteRole(id);

      if (response.status === "success") {
        notify.success(response.message || "Role deleted successfully");
        dispatch(deleteRoleActionCreator(id));
        return response;
      } else {
        throw new Error(response.message || "Failed to delete role");
      }
    } catch (error: any) {
      dispatch(setErrorActionCreator(error.message));
      notify.error(error.message || "Failed to delete role");
      throw error;
    }
  };
};
