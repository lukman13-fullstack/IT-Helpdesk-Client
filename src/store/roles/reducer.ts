import { ActionType } from "./action";
import type { RolesState, RolesAction } from "./types";

const initialState: RolesState = {
  roles: [],
  roleDetail: null,
  permissions: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

export default function rolesReducer(
  state: RolesState = initialState,
  action: RolesAction
): RolesState {
  switch (action.type) {
    case ActionType.GET_ROLES:
      return {
        ...state,
        roles: action.payload.roles,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case ActionType.GET_ROLE:
      return {
        ...state,
        roleDetail: action.payload,
        loading: false,
        error: null,
      };
    case ActionType.GET_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload,
        loading: false,
        error: null,
      };
    case ActionType.ADD_ROLE:
      return {
        ...state,
        roles: [...state.roles, action.payload],
        loading: false,
        error: null,
      };
    case ActionType.UPDATE_ROLE:
      return {
        ...state,
        roles: state.roles.map((role) =>
          role.id === action.payload.id ? action.payload : role
        ),
        roleDetail:
          state.roleDetail?.id === action.payload.id
            ? action.payload
            : state.roleDetail,
        loading: false,
        error: null,
      };
    case ActionType.DELETE_ROLE:
      return {
        ...state,
        roles: state.roles.filter((role) => role.id !== action.payload),
        loading: false,
        error: null,
      };
    case ActionType.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
}
