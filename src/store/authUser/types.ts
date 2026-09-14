import { ActionType } from "./action";

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: {
    id: number;
    name: string;
    description?: string;
    permissions: Array<{
      permission: {
        id: number;
        name: string;
        description?: string;
      };
    }>;
  };
  departments: string[];
  departmentIds?: number[];
  accessToken?: string;
  refreshToken?: string;
}

export interface SetAuthUserAction {
  type: typeof ActionType.SET_AUTH_USER;
  payload: AuthUser;
}

export interface UnsetAuthUserAction {
  type: typeof ActionType.UNSET_AUTH_USER;
}

export type AuthUserAction = SetAuthUserAction | UnsetAuthUserAction;
