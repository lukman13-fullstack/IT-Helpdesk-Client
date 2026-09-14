import {
  getUsers,
  addUser,
  getUserDetail,
  updateUser,
  deleteUser,
  resetPassword,
} from "../../services/api/users";
import type { UserCreate } from "../../services/api/types/user.types";
import { notify } from "@/lib/toast";

export const ActionType = {
  GET_ALL_USERS: "GET_ALL_USERS",
  ADD_USER: "ADD_USER",
  GET_USER_DETAIL: "GET_USER_DETAIL",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
};

export const ReceiveAllUsersActionCreator = (data: {
  users: UserCreate[];
  pagination: any;
}) => {
  return {
    type: ActionType.GET_ALL_USERS,
    payload: data.users,
    pagination: data.pagination,
  };
};

export const AddUserActionCreator = (user: UserCreate) => {
  return {
    type: ActionType.ADD_USER,
    payload: user,
  };
};

export const UpdateUserActionCreator = (user: UserCreate) => {
  return {
    type: ActionType.UPDATE_USER,
    payload: user,
  };
};

export const DeleteUserActionCreator = (id: number | string) => {
  return {
    type: ActionType.DELETE_USER,
    payload: id,
  };
};

export const AsyncGetAllUsersActionCreator = (
  page: number,
  limit: number,
  search: string
) => {
  return async (dispatch: any) => {
    try {
      const response = await getUsers(page, limit, search);
      dispatch(ReceiveAllUsersActionCreator(response));
    } catch (error) {
      console.error("Error fetching users:", error);
      notify.error("Failed to fetch users.");
    }
  };
};

export const ReceiveUserDetailActionCreator = (data: UserCreate) => {
  return {
    type: ActionType.GET_USER_DETAIL,
    payload: data,
  };
};

export const AsyncGetUserDetailActionCreator = (id: number) => {
  return async (dispatch: any) => {
    try {
      const response = await getUserDetail(id);
      dispatch(ReceiveUserDetailActionCreator(response));
    } catch (error) {
      console.error("Error fetching user detail:", error);
      notify.error("Failed to fetch user detail.");
    }
  };
};

export const AsyncAddUserActionCreator = (user: UserCreate) => {
  return async (dispatch: any) => {
    try {
      const response = await addUser(user);
      if (response.status === "success") {
        notify.success(response.message || "User added successfully!");
        dispatch(AddUserActionCreator(response.data));
        return response;
      } else if (response.status === "error") {
        if (response.data?.errors && Array.isArray(response.data.errors)) {
          const errorMessages = response.data.errors.join("\n");
          notify.error(`${response.message}:\n${errorMessages}`);
        } else {
          notify.error(response.message);
        }
        throw new Error(response.message);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      if (
        !error.message ||
        error.message === "Unexpected response from server"
      ) {
        notify.error("Error adding user");
      }
      throw error;
    }
  };
};

export const AsyncUpdateUserActionCreator = (id: number, user: UserCreate) => {
  return async (dispatch: any) => {
    try {
      const response = await updateUser(id.toString(), user);
      if (response.status === "success") {
        notify.success(response.message || "User updated successfully!");
        dispatch(UpdateUserActionCreator(response.data));
        return response;
      } else if (response.status === "error") {
        if (response.data?.errors && Array.isArray(response.data.errors)) {
          const errorMessages = response.data.errors.join("\n");
          notify.error(`${response.message}:\n${errorMessages}`);
        } else {
          notify.error(response.message);
        }
        throw new Error(response.message);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      if (
        !error.message ||
        error.message === "Unexpected response from server"
      ) {
        notify.error("Error updating user");
      }
      throw error;
    }
  };
};

export const AsyncDeleteUserActionCreator = (id: number | string) => {
  return async (dispatch: any) => {
    try {
      const response = await deleteUser(id?.toString() || "");
      if (response.status === "success") {
        notify.success(response.message);
        dispatch(DeleteUserActionCreator(id));
        return response;
      } else if (response.status === "error") {
        notify.error(response.message);
        throw new Error(response.message);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      if (
        !error.message ||
        error.message === "Unexpected response from server"
      ) {
        notify.error("Error deleting user");
      }
      throw error;
    }
  };
};

export const AsyncResetPasswordActionCreator = (
  id: number | string,
  password: string
) => {
  return async () => {
    try {
      const response = await resetPassword(id.toString(), password);
      if (response.status === "success") {
        notify.success(response.message);
        return response;
      } else if (response.status === "error") {
        notify.error(response.message);
        throw new Error(response.message);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      if (
        !error.message ||
        error.message === "Unexpected response from server"
      ) {
        notify.error("Error resetting password");
      }
      throw error;
    }
  };
};
