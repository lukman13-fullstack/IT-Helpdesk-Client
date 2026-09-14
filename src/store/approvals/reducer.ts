import { ActionType } from "./action";
import type { ApprovalsState, ApprovalsAction } from "./types";

const initialState: ApprovalsState = {
  approvalRequests: [],
  pagination: null,
  loading: false,
  error: null,
};

export default function approvalsReducer(
  state: ApprovalsState = initialState,
  action: ApprovalsAction
): ApprovalsState {
  switch (action.type) {
    case ActionType.GET_APPROVAL_REQUESTS:
      return {
        ...state,
        approvalRequests: action.payload.approvals,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case ActionType.REMOVE_APPROVAL_REQUEST:
      return {
        ...state,
        approvalRequests: state.approvalRequests.filter(
          (approval) => approval.id !== action.payload
        ),
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
