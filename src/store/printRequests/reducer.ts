import { ActionType } from "./action";
import type { Pagination } from "@/services/api/types/documents.types";

export interface PrintRequestsState {
  printRequests: any[];
  printHistory: any[];
  allPrintHistory: any[];
  allPrintPagination: Pagination;
  printDetail: any | null;
  pagination: Pagination;
  loading: boolean;
  error: string | null;
}

const initialState: PrintRequestsState = {
  printRequests: [],
  printHistory: [],
  allPrintHistory: [],
  allPrintPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  printDetail: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

function printRequestsReducer(
  state = initialState,
  action: any
): PrintRequestsState {
  switch (action.type) {
    case ActionType.GET_PRINT_REQUESTS:
      return {
        ...state,
        printRequests:
          action.payload.approvals || action.payload.requests || [],
        pagination: action.payload.pagination,
        loading: false,
      };
    case ActionType.GET_PRINT_HISTORY:
      return {
        ...state,
        printHistory: action.payload.approvals || action.payload.requests || [],
        pagination: action.payload.pagination,
        loading: false,
      };
    case ActionType.GET_ALL_PRINT_HISTORY:
      return {
        ...state,
        allPrintHistory: action.payload.requests || [],
        allPrintPagination: action.payload.pagination,
        loading: false,
      };
    case ActionType.GET_PRINT_DETAIL:
      return {
        ...state,
        printDetail: action.payload,
      };
    case ActionType.ADD_PRINT_HISTORY:
      return {
        ...state,
        printHistory: [action.payload, ...state.printHistory],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1,
        },
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

export default printRequestsReducer;
