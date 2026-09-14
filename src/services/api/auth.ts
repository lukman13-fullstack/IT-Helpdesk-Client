import {
  putAccessToken,
  getAccessToken,
  putRefreshToken,
  clearAccessToken,
  BASE_URL,
  _fetchWithAuth,
} from "./client";
import type {
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  LogoutResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ProfileData,
} from "./types";

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password } as LoginRequest),
    });

    const data: LoginResponse = await response.json();

    if (data.status === "success" && data.data) {
      const normalizedData = {
        ...data.data,
        departments: Array.isArray(data.data.departments)
          ? data.data.departments.map((dept: any) =>
              typeof dept === "string" ? dept : dept.name
            )
          : [],
      };

      putAccessToken(normalizedData.accessToken);
      putRefreshToken(normalizedData.refreshToken);

      return {
        status: "success",
        message: data.message,
        data: normalizedData,
      };
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Login failed",
    };
  }
}

export async function getUserProfile(): Promise<ProfileData | null> {
  try {
    const token = getAccessToken();
    if (!token) return null;

    const response = await _fetchWithAuth(`${BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: ProfileResponse = await response.json();

    if (data.status === "success" && data.data) {
      const normalizedData = {
        ...data.data,
        departments: Array.isArray(data.data.departments)
          ? data.data.departments.map((dept: any) => {
              if (typeof dept === "string") {
                return dept;
              } else if (dept.department?.name) {
                return dept.department.name;
              } else if (dept.name) {
                return dept.name;
              }
              return "";
            })
          : [],
        departmentIds: Array.isArray(data.data.departments)
          ? data.data.departments
              .map((dept: any) => {
                if (dept.department?.id) return dept.department.id;
                if (dept.departmentId) return dept.departmentId;
                if (dept.id) return dept.id;
                return null;
              })
              .filter(Boolean)
          : [],
      };

      return normalizedData;
    }

    return null;
  } catch (error) {
    console.error("Get profile error:", error);
    return null;
  }
}

export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await _fetchWithAuth(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: LogoutResponse = await response.json();

    clearAccessToken();

    return data;
  } catch (error) {
    console.error("Logout error:", error);
    clearAccessToken();
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Logout failed",
    };
  }
}
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<ChangePasswordResponse> {
  try {
    const response = await _fetchWithAuth(`${BASE_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      } as ChangePasswordRequest),
    });

    const data: ChangePasswordResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Change password error:", error);
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Change password failed",
    };
  }
}
