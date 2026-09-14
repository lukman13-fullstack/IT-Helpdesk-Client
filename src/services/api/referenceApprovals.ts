import { _fetchWithAuth, BASE_URL } from "./client";

export interface ReferenceCheck {
  id: number;
  documentId: number;
  referenceId: number;
  status: "pending" | "approved" | "rejected";
  comments: string | null;
  checkedAt: string | null;
  checkedBy: number | null;
  createdAt: string;
  updatedAt: string;
  document: {
    id: number;
    name: string;
    documentCode: string;
    category: string;
    status: string;
    uploader: {
      id: number;
      fullName: string;
      email: string;
    };
    department: {
      id: number;
      name: string;
      departmentCode: string;
    };
  };
  reference: {
    id: number;
    name: string;
    code: string;
    checker: {
      id: number;
      fullName: string;
    } | null;
  };
  checker: {
    id: number;
    fullName: string;
  } | null;
}

export interface ReferenceCheckResponse {
  success: boolean;
  data: ReferenceCheck[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getReferenceChecks = async (
  status: string = "pending",
  page: number = 1,
  limit: number = 10
): Promise<ReferenceCheckResponse> => {
  const response = await _fetchWithAuth(
    `${BASE_URL}/reference-approvals?status=${status}&page=${page}&limit=${limit}`
  );
  const json = await response.json();
  return json;
};

export const approveReferenceCheck = async (
  id: number,
  comments?: string
): Promise<{ success: boolean; message: string; data: ReferenceCheck }> => {
  const response = await _fetchWithAuth(
    `${BASE_URL}/reference-approvals/${id}/approve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comments }),
    }
  );
  const json = await response.json();
  return json;
};

export const rejectReferenceCheck = async (
  id: number,
  comments: string
): Promise<{ success: boolean; message: string; data: ReferenceCheck }> => {
  const response = await _fetchWithAuth(
    `${BASE_URL}/reference-approvals/${id}/reject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comments }),
    }
  );
  const json = await response.json();
  return json;
};
