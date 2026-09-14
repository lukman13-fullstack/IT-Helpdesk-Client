import type { ReferenceCheck } from "@/services/api/referenceApprovals";

export interface ReferenceApprovalState {
  referenceChecks: ReferenceCheck[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ActionType = {
  SET_REFERENCE_CHECKS: "SET_REFERENCE_CHECKS",
  SET_REFERENCE_APPROVAL_LOADING: "SET_REFERENCE_APPROVAL_LOADING",
  SET_REFERENCE_APPROVAL_ERROR: "SET_REFERENCE_APPROVAL_ERROR",
  SET_REFERENCE_APPROVAL_PAGINATION: "SET_REFERENCE_APPROVAL_PAGINATION",
  UPDATE_REFERENCE_CHECK_STATUS: "UPDATE_REFERENCE_CHECK_STATUS",
} as const;

const initialState: ReferenceApprovalState = {
  referenceChecks: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

function referenceApprovalReducer(
  state = initialState,
  action: any
): ReferenceApprovalState {
  switch (action.type) {
    case ActionType.SET_REFERENCE_CHECKS:
      return {
        ...state,
        referenceChecks: action.payload,
      };
    case ActionType.SET_REFERENCE_APPROVAL_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case ActionType.SET_REFERENCE_APPROVAL_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case ActionType.SET_REFERENCE_APPROVAL_PAGINATION:
      return {
        ...state,
        pagination: action.payload,
      };
    case ActionType.UPDATE_REFERENCE_CHECK_STATUS:
      return {
        ...state,
        referenceChecks: state.referenceChecks.map((check) =>
          check.id === action.payload.id
            ? { ...check, status: action.payload.status }
            : check
        ),
      };
    default:
      return state;
  }
}

export default referenceApprovalReducer;
