import { _fetchWithAuth, BASE_URL } from "./client";
import type {
  ApprovalStatus,
  ApprovalActionData,
  ApprovalRequestsResponse,
  ApprovalActionResponse,
  ApiResponse,
} from "./types/documents.types";

import { getPrintRequests } from "./documents";

export async function getApprovalRequests(
  status?: ApprovalStatus,
  page: number = 1,
  limit: number = 10
) {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  queryParams.append("limit", limit.toString());
  if (status) queryParams.append("status", status);

  const url = `${BASE_URL}/approvals/requests?${queryParams.toString()}`;

  const shouldFetchPrintRequests = !status || status === "pending";

  const [approvalResponse, printApprovalsResponse] = await Promise.all([
    _fetchWithAuth(url).then((r) => r.json()),
    shouldFetchPrintRequests
      ? getPrintRequests({ status: "pending", page, limit })
      : Promise.resolve({ approvals: [], pagination: { total: 0 } }),
  ]);

  const json: ApiResponse<ApprovalRequestsResponse> = approvalResponse;

  const printRequests: any[] = printApprovalsResponse.approvals.map(
    (approval: any) => ({
      id: approval.id,
      documentId: approval.printRequest.documentId,
      creator: {
        fullName: approval.printRequest.requester.fullName,
      },
      level: 0,
      type: "Print Request",
      status: approval.status,
      document: {
        id: approval.printRequest.document.id,
        name: approval.printRequest.document.name,
        documentCode: approval.printRequest.document.documentCode,
        status: "approved",
        department: { name: "N/A", departmentCode: "N/A", id: 0 },
        uploader: approval.printRequest.requester,
      },
      createdAt: approval.createdAt,
      updatedAt: approval.createdAt,
      approver: {},
      approverId: approval.approverId,
      isPrintRequest: true,
      printApproval: approval,
    })
  );

  const allApprovals = [...json.data, ...printRequests];

  allApprovals.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    approvals: allApprovals,
    pagination: json.pagination || {
      page: 1,
      limit: 10,
      total: allApprovals.length,
      totalPages: 1,
    },
  };
}

export async function getApprovalDetail(approvalId: string | number, type: "document" | "reference" = "document") {
  const url = type === "reference" 
    ? `${BASE_URL}/approvals/reference/${approvalId}/detail`
    : `${BASE_URL}/approvals/${approvalId}/detail`;

  const response = await _fetchWithAuth(url);
  const json: ApiResponse<ApprovalActionData> = await response.json(); 
  return json;
}

export async function approveDocument(
  approvalId: string | number,
  data: ApprovalActionData = {}
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/approvals/${approvalId}/approve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const json: ApiResponse<ApprovalActionResponse> = await response.json();
  return json;
}

export async function approveBatchDocuments(
  approvalIds: (string | number)[],
  data: ApprovalActionData = {}
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/approvals/batch-approve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ approvalIds, ...data }),
    }
  );

  const json: ApiResponse<any> = await response.json();
  return json;
}

export async function rejectDocument(
  approvalId: string | number,
  data: ApprovalActionData
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/approvals/${approvalId}/reject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const json: ApiResponse<ApprovalActionResponse> = await response.json();
  return json;
}
