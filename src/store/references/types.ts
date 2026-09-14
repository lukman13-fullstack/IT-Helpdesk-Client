import type { DocumentReference } from "@/services/api/references";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReferencesState {
  references: DocumentReference[];
  referenceDetail: DocumentReference | null;
  allReferences: DocumentReference[]; // For dropdowns
  pagination: Pagination;
  loading: boolean;
  error: string | null;
}

export interface ReferencesAction {
  type: string;
  payload?: any;
}
