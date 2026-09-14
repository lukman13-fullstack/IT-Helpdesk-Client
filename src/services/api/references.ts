import { _fetchWithAuth, BASE_URL } from "./client";

export interface DocumentReference {
  id: number;
  name: string;
  code: string;
  description?: string;
  checkerId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  checker?: {
    id: number;
    fullName: string;
    email?: string;
  };
  _count?: {
    documents: number;
  };
}

export interface GetReferencesParams {
  page?: number;
  limit?: number;
  search?: string;
  all?: boolean;
}

export interface CreateReferenceData {
  name: string;
  code: string;
  description?: string;
  checkerId?: number;
}

export interface UpdateReferenceData {
  name: string;
  code: string;
  description?: string;
  checkerId?: number | null;
  isActive?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// Get all references with pagination
export async function getReferences(params: GetReferencesParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.all) queryParams.append("all", "true");

  const url = `${BASE_URL}/references${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await _fetchWithAuth(url);

  const json: ApiResponse<{
    references: DocumentReference[];
    pagination?: Pagination;
  }> = await response.json();

  return {
    references: json.data.references,
    pagination: json.data.pagination,
  };
}

// Get all active references (for dropdowns)
export async function getAllActiveReferences() {
  const url = `${BASE_URL}/references?all=true`;
  const response = await _fetchWithAuth(url);

  const json: ApiResponse<{
    references: DocumentReference[];
  }> = await response.json();

  return json.data.references;
}

// Get reference by ID
export async function getReferenceById(id: number | string) {
  const response = await _fetchWithAuth(`${BASE_URL}/references/${id}`);
  const json: ApiResponse<DocumentReference> = await response.json();
  return json.data;
}

// Create reference
export async function createReference(data: CreateReferenceData) {
  const response = await _fetchWithAuth(`${BASE_URL}/references/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json: ApiResponse<DocumentReference> = await response.json();
  
  if (json.status === "error") {
    throw new Error(json.message);
  }
  
  return json.data;
}

// Update reference
export async function updateReference(
  id: number | string,
  data: UpdateReferenceData
) {
  const response = await _fetchWithAuth(`${BASE_URL}/references/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const json: ApiResponse<DocumentReference> = await response.json();
  
  if (json.status === "error") {
    throw new Error(json.message);
  }
  
  return json.data;
}

// Delete reference
export async function deleteReference(id: number | string) {
  const response = await _fetchWithAuth(`${BASE_URL}/references/${id}`, {
    method: "DELETE",
  });

  const json: ApiResponse<null> = await response.json();
  
  if (json.status === "error") {
    throw new Error(json.message);
  }
  
  return json;
}
