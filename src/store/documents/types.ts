import type {
  Document,
  DocumentDetail,
  DocumentHistory,
  Pagination,
} from "@/services/api/types/documents.types";

export interface DocumentsState {
  documents: Document[];
  obsoleteDocuments: Document[];
  sharedDocuments: Document[];
  documentDetail: DocumentDetail | null;
  documentHistory: DocumentHistory[];
  pagination: Pagination;
  obsoletePagination: Pagination;
  loading: boolean;
  error: string | null;
}

export interface DocumentsAction {
  type: string;
  payload?: any;
}
