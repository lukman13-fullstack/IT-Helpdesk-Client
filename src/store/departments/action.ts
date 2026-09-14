import { notify } from "@/lib/toast";
import type {
  Department,
  DepartmentDetail,
} from "@/services/api/types/departements.types";
import {
  getDepartments,
  deleteDepartment,
  getDepartmentByID,
  createDepartment,
  updateDepartment,
} from "@/services/api/departments";

export const ActionType = {
  GET_DEPARTMENTS: "GET_DEPARTMENTS",
  GET_DEPARTMENT: "GET_DEPARTMENT",
  ADD_DEPARTMENT: "ADD_DEPARTMENT",
  UPDATE_DEPARTMENT: "UPDATE_DEPARTMENT",
  DELETE_DEPARTMENT: "DELETE_DEPARTMENT",
};

const getDepartmentsActionCreator = (data: {
  departments: Department[];
  pagination: any;
}) => {
  return {
    type: ActionType.GET_DEPARTMENTS,
    payload: data,
  };
};

const getDepartmentByIDActionCreator = (data: DepartmentDetail) => {
  return {
    type: ActionType.GET_DEPARTMENT,
    payload: data,
  };
};

const addDepartmentActionCreator = (department: Department) => {
  return {
    type: ActionType.ADD_DEPARTMENT,
    payload: department,
  };
};

const updateDepartmentActionCreator = (department: Department) => {
  return {
    type: ActionType.UPDATE_DEPARTMENT,
    payload: department,
  };
};

const deleteDepartmentActionCreator = (id: string | number) => {
  return {
    type: ActionType.DELETE_DEPARTMENT,
    payload: id,
  };
};

export const asyncGetDepartmentsActionCreator = (
  page: number = 1,
  limit: number = 10,
  searchQuery: string = ""
) => {
  return async (dispatch: any) => {
    try {
      const response = await getDepartments(page, limit, searchQuery);
      dispatch(getDepartmentsActionCreator(response));
    } catch (error) {
      notify.error("Failed to get departments");
    }
  };
};

export const asyncDeleteDepartmentActionCreator = (id: string | number) => {
  return async (dispatch: any) => {
    try {
      const response = await deleteDepartment(id);
      const json = await response.json();
      if (response.status === 200) {
        notify.success(json.message || "Department deleted successfully");
        dispatch(deleteDepartmentActionCreator(id));
      } else {
        notify.error(json.message || "Failed to delete department");
      }
    } catch (error) {
      notify.error("Failed to delete department");
    }
  };
};

export const asyncGetDepartmentByIDActionCreator = (id: string | number) => {
  return async (dispatch: any) => {
    try {
      const response = await getDepartmentByID(id);
      dispatch(getDepartmentByIDActionCreator(response));
    } catch (error) {
      notify.error("Failed to get department");
    }
  };
};

export const asyncCreateDepartmentActionCreator = (department: Department) => {
  return async (dispatch: any) => {
    try {
      const response = await createDepartment(department);
      if (response.status === 200 || response.status === "success") {
        notify.success(response.message || "Department created successfully");
        dispatch(addDepartmentActionCreator(department));
        return response;
      } else {
        throw new Error(response.message || "Failed to create department");
      }
    } catch (error: any) {
      notify.error(error.message);
      throw error;
    }
  };
};

export const asyncUpdateDepartmentActionCreator = (
  id: string | number,
  department: Department
) => {
  return async (dispatch: any) => {
    try {
      const response = await updateDepartment(id, department);
      if (response.status === 200 || response.status === "success") {
        notify.success(response.message || "Department updated successfully");
        dispatch(updateDepartmentActionCreator(department));
        return response;
      } else {
        throw new Error(response.message || "Failed to update department");
      }
    } catch (error: any) {
      notify.error(error.message);
      throw error;
    }
  };
};
