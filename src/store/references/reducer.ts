import { ActionType } from "./action";
import type { ReferencesState, ReferencesAction } from "./types";

const initialState: ReferencesState = {
  references: [],
  referenceDetail: null,
  allReferences: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

export default function referencesReducer(
  state: ReferencesState = initialState,
  action: ReferencesAction
): ReferencesState {
  switch (action.type) {
    case ActionType.GET_REFERENCES:
      return {
        ...state,
        references: action.payload.references,
        pagination: action.payload.pagination || state.pagination,
        loading: false,
        error: null,
      };
    case ActionType.GET_REFERENCE:
      return {
        ...state,
        referenceDetail: action.payload,
        loading: false,
        error: null,
      };
    case ActionType.GET_ALL_REFERENCES:
      return {
        ...state,
        allReferences: action.payload,
        loading: false,
        error: null,
      };
    case ActionType.ADD_REFERENCE:
      return {
        ...state,
        references: [...state.references, action.payload],
        allReferences: [...state.allReferences, action.payload],
        loading: false,
        error: null,
      };
    case ActionType.UPDATE_REFERENCE:
      return {
        ...state,
        references: state.references.map((ref) =>
          ref.id === action.payload.id ? action.payload : ref
        ),
        allReferences: state.allReferences.map((ref) =>
          ref.id === action.payload.id ? action.payload : ref
        ),
        referenceDetail:
          state.referenceDetail?.id === action.payload.id
            ? action.payload
            : state.referenceDetail,
        loading: false,
        error: null,
      };
    case ActionType.DELETE_REFERENCE:
      return {
        ...state,
        references: state.references.filter((ref) => ref.id !== action.payload),
        allReferences: state.allReferences.filter((ref) => ref.id !== action.payload),
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
