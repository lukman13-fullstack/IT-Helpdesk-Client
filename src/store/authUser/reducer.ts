import { ActionType } from "./action";
import type { Action } from "redux";
import type { AuthUser, AuthUserAction } from "./types";

interface AuthUserState {
  user: AuthUser | null;
  error: string | null;
}

const initialState: AuthUserState = {
  user: null,
  error: null,
};

function isAuthUserAction(action: Action): action is AuthUserAction {
  return (
    action.type === ActionType.SET_AUTH_USER ||
    action.type === ActionType.UNSET_AUTH_USER
  );
}

function authUserReducer(
  state: AuthUserState = initialState,
  action: Action
): AuthUserState {
  if (isAuthUserAction(action)) {
    switch (action.type) {
      case ActionType.SET_AUTH_USER:
        return { ...state, user: action.payload, error: null };
      case ActionType.UNSET_AUTH_USER:
        return { ...state, user: null, error: null };
      default:
        return state;
    }
  }
  return state;
}

export default authUserReducer;
