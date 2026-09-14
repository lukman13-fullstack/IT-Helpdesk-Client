import {
  login,
  getUserProfile,
  logout as apiLogout,
  changePassword,
} from "@/services/api/auth";
import type { AuthUser, SetAuthUserAction, UnsetAuthUserAction } from "./types";
import { notify } from "@/lib/toast";

export const ActionType = {
  SET_AUTH_USER: "SET_AUTH_USER",
  UNSET_AUTH_USER: "UNSET_AUTH_USER",
} as const;

export function setAuthUserActionCreator(
  authUser: AuthUser
): SetAuthUserAction {
  return {
    type: ActionType.SET_AUTH_USER,
    payload: authUser,
  };
}

export function unsetAuthUserActionCreator(): UnsetAuthUserAction {
  return {
    type: ActionType.UNSET_AUTH_USER,
  };
}

export function initAuthUserFromToken() {
  return async (dispatch: (action: unknown) => void) => {
    try {
      const user = await getUserProfile();
      if (user) {
        dispatch(setAuthUserActionCreator(user));
      }
    } catch (error) {
      console.error("Failed to initialize user from token:", error);
      dispatch(unsetAuthUserActionCreator());
    }
  };
}

export function asyncSetAuthUser({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  return async (dispatch: (action: unknown) => void) => {
    try {
      const result = await login(username, password);

      if (result.status === "success" && result.data) {
        const profileData = await getUserProfile();

        if (profileData) {
          notify.success(result.message || "Login successful");
          dispatch(setAuthUserActionCreator(profileData));
        } else {
          notify.success(result.message || "Login successful");
          dispatch(setAuthUserActionCreator(result.data));
        }
      } else {
        notify.error(result.message || "Login failed");
        dispatch(unsetAuthUserActionCreator());
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      notify.error(errorMessage);
      dispatch(unsetAuthUserActionCreator());
    }
  };
}

export function asyncLogout() {
  return async (dispatch: (action: unknown) => void) => {
    try {
      const result = await apiLogout();
      if (result.status === "success") {
        notify.success(result.message || "Logout successful");
      }
      dispatch(unsetAuthUserActionCreator());
    } catch (error) {
      console.error("Logout error:", error);
      notify.error("Logout failed");
      dispatch(unsetAuthUserActionCreator());
    } finally {
    }
  };
}

export function asyncChangePassword({
  oldPassword,
  newPassword,
}: {
  oldPassword: string;
  newPassword: string;
}) {
  return async (dispatch: (action: unknown) => void) => {
    try {
      const result = await changePassword(oldPassword, newPassword);

      if (result.status === "success") {
        notify.success("Password berhasil diubah. Silahkan login kembali");

        setTimeout(() => {
          dispatch(unsetAuthUserActionCreator());
        }, 3000);
      } else {
        if (result.data?.errors && result.data.errors.length > 0) {
          result.data.errors.forEach((error) => {
            notify.error(error);
          });
        } else {
          notify.error(result.message || "Change password failed");
        }
      }
    } catch (error) {
      console.error("Change password error:", error);
      notify.error("Change password failed");
    }
  };
}
