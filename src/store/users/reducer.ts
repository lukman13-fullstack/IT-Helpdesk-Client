import { ActionType } from "./action";
import type { User } from "@/services/api/types/user.types";

export interface UsersState {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
  usersDetail: User | null;
}

const initialState: UsersState = {
  users: [],
  pagination: null,
  loading: false,
  error: null,
  usersDetail: null,
};

const usersReducer = (state = initialState, action: any): UsersState => {
  switch (action.type) {
    case ActionType.GET_ALL_USERS:
      return {
        ...state,
        users: action.payload,
        pagination: action.pagination,
        loading: false,
        error: null,
      };
    case ActionType.ADD_USER:
      return {
        ...state,
        users: [...state.users, action.payload],
        loading: false,
        error: null,
      };
    case ActionType.GET_USER_DETAIL:
      return {
        ...state,
        usersDetail: action.payload,
        loading: false,
        error: null,
      };
    case ActionType.DELETE_USER:
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.payload),
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export default usersReducer;
