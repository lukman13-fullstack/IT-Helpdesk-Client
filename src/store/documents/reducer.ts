import { ActionType } from "./action";
import type { DocumentsState, DocumentsAction } from "./types";

const initialState: DocumentsState = {
  documents: [],
  documentDetail: null,
  obsoleteDocuments: [],
  sharedDocuments: [],
  documentHistory: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  obsoletePagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

export default function documentsReducer(
  state: DocumentsState = initialState,
  action: DocumentsAction
): DocumentsState {
  switch (action.type) {
    case ActionType.GET_DOCUMENTS:
      return {
        ...state,
        documents: action.payload.documents,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case ActionType.GET_DOCUMENT:
      return {
        ...state,
        documentDetail: action.payload,
        loading: false,
        error: null,
      };
    case ActionType.ADD_DOCUMENT:
      return {
        ...state,
        documents: [...state.documents, action.payload],
        loading: false,
        error: null,
      };
    case ActionType.UPDATE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload.id ? action.payload : doc
        ),
        documentDetail:
          state.documentDetail?.id === action.payload.id
            ? action.payload
            : state.documentDetail,
        loading: false,
        error: null,
      };
    case ActionType.DELETE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter((doc) => doc.id !== action.payload),
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
    case ActionType.SET_OBSOLETE_DOCUMENTS:
      return {
        ...state,
        obsoleteDocuments: action.payload.documents,
        obsoletePagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case ActionType.SET_SHARED_DOCUMENTS:
      return {
        ...state,
        sharedDocuments: action.payload.documents,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case ActionType.SET_DOCUMENT_HISTORY:
      return {
        ...state,
        documentHistory: action.payload,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}
