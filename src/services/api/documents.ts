import { _fetchWithAuth, _uploadWithAuth, BASE_URL } from "./client";
import type {
  Document,
  DocumentDetail,
  DocumentHistory,
  GetDocumentsParams,
  CreateDocumentData,
  UpdateDocumentData,
  ReviseDocumentData,
  Pagination,
  ApiResponse,
  PrintApproval,
  MasterDocumentIndex,
  FormMasterIndexData,
} from "./types/documents.types";

const getExtFromMimeType = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      ".xlsx",
    "application/vnd.ms-excel": ".xls",
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "text/plain": ".txt",
  };
  return mimeToExt[mimeType] || ".pdf"; // Default to .pdf if unknown
};

export async function getDocuments(params: GetDocumentsParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.departmentId)
    queryParams.append("departmentId", params.departmentId.toString());
  if (params.status) queryParams.append("status", params.status);
  if (params.category) queryParams.append("category", params.category);
  if (params.search) queryParams.append("search", params.search);
  if (params.destination) queryParams.append("destination", params.destination);

  const url = `${BASE_URL}/documents${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await _fetchWithAuth(url);

  const json: {
    success: boolean;
    data: Document[];
    pagination: Pagination;
  } = await response.json();

  return {
    documents: json.data,
    pagination: json.pagination,
  };
}

export async function getDocumentById(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/documents/${id}`);
  const json: ApiResponse<DocumentDetail> = await response.json();
  return json.data;
}

export async function createDocument(
  data: CreateDocumentData,
  onUploadProgress?: (progressEvent: ProgressEvent) => void
) {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.proposalObjective)
    formData.append("proposalObjective", data.proposalObjective);
  if (data.category) formData.append("category", data.category);
  formData.append("isInternal", data.isInternal.toString());

  // Add all text/conditional fields BEFORE files for better Multer parsing
  if (data.documentFormat)
    formData.append("documentFormat", data.documentFormat);
  if (data.retentionPeriod)
    formData.append("retentionPeriod", data.retentionPeriod.toString());
  if (data.hardDocumentRetentionPeriod)
    formData.append(
      "hardDocumentRetentionPeriod",
      data.hardDocumentRetentionPeriod.toString()
    );
  if (data.storageLocation)
    formData.append("storageLocation", data.storageLocation);
  if (data.hardDocumentStorageLocation)
    formData.append(
      "hardDocumentStorageLocation",
      data.hardDocumentStorageLocation
    );
  if (data.publishingInstitution)
    formData.append("publishingInstitution", data.publishingInstitution);
  if (data.dateOfIssue) formData.append("dateOfIssue", data.dateOfIssue);
  if (data.expiredDate) formData.append("expiredDate", data.expiredDate);
  if (data.documentStoragePeriod)
    formData.append(
      "documentStoragePeriod",
      data.documentStoragePeriod.toString()
    );

  if (data.remark) formData.append("remark", data.remark);
  if (data.destination) formData.append("destination", data.destination);
  if (data.templateData) formData.append("templateData", data.templateData);

  // Add reference IDs
  if (data.referenceIds && data.referenceIds.length > 0)
    formData.append("referenceIds", JSON.stringify(data.referenceIds));

  // Append files LAST (only if present)
  if (data.file) formData.append("file", data.file);
  if (data.masterDocumentFile)
    formData.append("masterDocumentFile", data.masterDocumentFile);

  const response = await _uploadWithAuth(`${BASE_URL}/documents`, {
    method: "POST",
    body: formData,
    onUploadProgress,
  });

  const json: ApiResponse<Document> = await response.json();
  return json;
}

export async function updateDocument(
  id: string | number,
  data: UpdateDocumentData,
  onUploadProgress?: (progressEvent: ProgressEvent) => void
) {
  const formData = new FormData();
  if (data.name) formData.append("name", data.name);
  if (data.category) formData.append("category", data.category);
  if (data.isInternal !== undefined)
    formData.append("isInternal", data.isInternal.toString());
  if (data.proposalObjective)
    formData.append("proposalObjective", data.proposalObjective);
  if (data.remark) formData.append("remark", data.remark);
  if (data.documentFormat) formData.append("documentFormat", data.documentFormat);
  if (data.retentionPeriod) formData.append("retentionPeriod", data.retentionPeriod);
  if (data.hardDocumentRetentionPeriod) formData.append("hardDocumentRetentionPeriod", data.hardDocumentRetentionPeriod);
  if (data.storageLocation) formData.append("storageLocation", data.storageLocation);
  if (data.hardDocumentStorageLocation) formData.append("hardDocumentStorageLocation", data.hardDocumentStorageLocation);
  if (data.publishingInstitution) formData.append("publishingInstitution", data.publishingInstitution);
  if (data.dateOfIssue) formData.append("dateOfIssue", data.dateOfIssue);
  if (data.expiredDate) formData.append("expiredDate", data.expiredDate);
  if (data.templateData) formData.append("templateData", data.templateData);
  if (data.file) formData.append("file", data.file);
  if (data.masterDocumentFile)
    formData.append("masterDocumentFile", data.masterDocumentFile);
  if (data.referenceIds && data.referenceIds.length > 0)
    formData.append("referenceIds", JSON.stringify(data.referenceIds));

  const response = await _uploadWithAuth(`${BASE_URL}/documents/${id}`, {
    method: "PUT",
    body: formData,
    onUploadProgress,
  });

  const json: ApiResponse<Document> = await response.json();
  return json;
}

export async function reviseDocument(
  id: string | number,
  data: ReviseDocumentData,
  onUploadProgress?: (progressEvent: ProgressEvent) => void
) {
  const formData = new FormData();
  formData.append("changeDescription", data.changeDescription);
  if (data.revisionPurpose)
    formData.append("revisionPurpose", data.revisionPurpose);
  if (data.documentFormat)
    formData.append("documentFormat", data.documentFormat);
  if (data.retentionPeriod)
    formData.append("retentionPeriod", data.retentionPeriod);
  if (data.storageLocation)
    formData.append("storageLocation", data.storageLocation);
  if (data.remark) formData.append("remark", data.remark);

  if (data.file) formData.append("file", data.file);
  if (data.masterDocumentFile)
    formData.append("masterDocumentFile", data.masterDocumentFile);
  if (data.templateData)
    formData.append("templateData", data.templateData);

  // New fields for external documents
  if (data.publishingInstitution)
    formData.append("publishingInstitution", data.publishingInstitution);
  if (data.dateOfIssue)
    formData.append("dateOfIssue", data.dateOfIssue);
  if (data.expiredDate)
    formData.append("expiredDate", data.expiredDate);
  if (data.name)
    formData.append("name", data.name);
  if (data.referenceIds && data.referenceIds.length > 0)
    formData.append("referenceIds", JSON.stringify(data.referenceIds));

  const response = await _uploadWithAuth(`${BASE_URL}/documents/${id}/revise`, {
    method: "POST",
    body: formData,
    onUploadProgress,
  });

  const json: ApiResponse<Document> = await response.json();
  return json;
}

export async function getWiTemplate(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/documents/${id}/wi-template`);
  const json = await response.json();
  return json;
}

export async function downloadDocument(id: string | number, name: string) {
  const response = await _fetchWithAuth(`${BASE_URL}/documents/${id}/download`);

  if (!response.ok) {
    // Try to parse the error message from backend
    try {
      const errorData = await response.json();
      const errorMessage = errorData.message || "Failed to download document";
      throw new Error(errorMessage);
    } catch (parseError) {
      // If parsing fails, throw generic error
      throw new Error("Failed to download document");
    }
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = name; // Default to name without extension if header is missing

  if (contentDisposition) {
    // Try to match filename* (UTF-8) first, then filename
    const filenameStarMatch = contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/
    );
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);

    if (filenameStarMatch) {
      filename = decodeURIComponent(filenameStarMatch[1]);
    } else if (filenameMatch) {
      filename = filenameMatch[1];
    }
  } else {
    // Fallback to Content-Type if Content-Disposition is missing
    const contentType = response.headers.get("Content-Type");
    if (contentType) {
      const ext = getExtFromMimeType(contentType);
      filename = `${name}${ext}`;
    } else {
      filename = `${name}.pdf`; // Ultimate fallback
    }
  }

  const blob = await response.blob();
  return { blob, filename };
}

export async function downloadMasterDocument(
  id: string | number,
  name: string,
  forceOriginal?: boolean
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/${id}/download?type=master${forceOriginal ? "&forceOriginal=true" : ""}`
  );

  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMessage =
        errorData.message || "Failed to download master document";
      throw new Error(errorMessage);
    } catch (parseError) {
      throw new Error("Failed to download master document");
    }
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `Master-${name}`;

  if (contentDisposition) {
    // Try to match filename* (UTF-8) first, then filename
    const filenameStarMatch = contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/
    );
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);

    if (filenameStarMatch) {
      filename = decodeURIComponent(filenameStarMatch[1]);
    } else if (filenameMatch) {
      filename = filenameMatch[1];
    }
  } else {
    // Fallback to Content-Type if Content-Disposition is missing
    const contentType = response.headers.get("Content-Type");
    if (contentType) {
      const ext = getExtFromMimeType(contentType);
      filename = `Master-${name}${ext}`;
    } else {
      filename = `Master-${name}.pdf`; // Ultimate fallback
    }
  }

  const blob = await response.blob();
  return { blob, filename };
}

export async function downloadPrintFile(
  id: string | number,
  name: string,
  type: "controlled" | "uncontrolled" | "master",
  printRequestId?: number
) {
  let url = `${BASE_URL}/documents/${id}/download?type=${type}`;
  if (printRequestId) url += `&printRequestId=${printRequestId}`;

  const response = await _fetchWithAuth(url);

  if (!response.ok) {
    try {
      const errorData = await response.json();
      const errorMessage =
        errorData.message || `Failed to download ${type} document`;
      throw new Error(errorMessage);
    } catch (parseError) {
      throw new Error(`Failed to download ${type} document`);
    }
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `${type}-${name}`;

  if (contentDisposition) {
    const filenameStarMatch = contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/
    );
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
    if (filenameStarMatch) {
      filename = decodeURIComponent(filenameStarMatch[1]);
    } else if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  const blob = await response.blob();
  return { blob, filename };
}

export async function getDocumentPreview(id: string | number): Promise<Blob> {
  const response = await _fetchWithAuth(`${BASE_URL}/documents/${id}/preview`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch document preview");
  }

  return response.blob();
}

export async function getPrintPreview(id: string | number): Promise<Blob> {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/${id}/print-preview`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch print preview");
  }

  return response.blob();
}

export async function markAsPrinted(
  documentId: string | number,
  printRequestId: number
): Promise<{ success: boolean }> {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/${documentId}/mark-printed/${printRequestId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to mark as printed");
  }

  return response.json();
}

export async function markAsReady(
  documentId: string | number,
  printRequestId: number
): Promise<{ success: boolean }> {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/${documentId}/mark-ready/${printRequestId}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to mark as ready");
  }

  return response.json();
}

export async function markAsTaken(
  documentId: string | number,
  printRequestId: number,
  data: { picTaken: string; takenAt?: string }
): Promise<{ success: boolean }> {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/${documentId}/mark-taken/${printRequestId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to record pickup");
  }

  return response.json();
}

export async function downloadDocumentForPrint(
  id: string | number,
  name: string,
  printRequestId: number
): Promise<{ blob: Blob; filename: string }> {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/${id}/download?printRequestId=${printRequestId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to download document");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition");
  let filename = `${name}.pdf`;

  if (contentDisposition) {
    const match = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );
    if (match && match[1]) {
      filename = match[1].replace(/['"]/g, "");
    }
  }

  return { blob, filename };
}

export async function deleteDocument(id: string | number, reason?: string) {
  const options: any = {
    method: "DELETE",
  };

  if (reason) {
    options.headers = {
      "Content-Type": "application/json",
    };
    options.body = JSON.stringify({ reason });
  }

  const response = await _fetchWithAuth(`${BASE_URL}/documents/${id}`, options);

  return response;
}

export async function forceDeleteObsoleteDocument(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/documents/obsolete/${id}/force`, {
    method: "DELETE",
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Failed to permanently delete obsolete document");
  }

  return json;
}



export async function togglePublishDocument(
  id: string | number,
  isPublished: boolean
) {
  const response = await _fetchWithAuth(`${BASE_URL}/documents/${id}/publish`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isPublished }),
  });

  const json: ApiResponse<Document> = await response.json();
  return json;
}

export async function toggleRawDownload(
  id: string | number,
  isRawDownloadable: boolean
) {
  const response = await _fetchWithAuth(`${BASE_URL}/documents/${id}/toggle-raw-download`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isRawDownloadable }),
  });

  const json: ApiResponse<Document> = await response.json();
  return json;
}

export async function getObsoleteDocuments(params: GetDocumentsParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);

  const url = `${BASE_URL}/documents/obsolete${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await _fetchWithAuth(url);

  const json: {
    success: boolean;
    data: Document[];
    pagination: Pagination;
  } = await response.json();

  return {
    documents: json.data,
    pagination: json.pagination,
  };
}

export async function getObsoleteDocumentById(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/documents/obsolete/${id}`);
  const json: ApiResponse<DocumentDetail> = await response.json();
  return json.data;
}

export async function downloadObsoleteDocument(
  id: string | number,
  name: string
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/obsolete/${id}/download`
  );

  if (!response.ok) {
    throw new Error("Failed to download obsolete document");
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = name;

  if (contentDisposition) {
    const filenameStarMatch = contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/
    );
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);

    if (filenameStarMatch) {
      filename = decodeURIComponent(filenameStarMatch[1]);
    } else if (filenameMatch) {
      filename = filenameMatch[1];
    }
  } else {
    const contentType = response.headers.get("Content-Type");
    if (contentType) {
      const ext = getExtFromMimeType(contentType);
      filename = `${name}${ext}`;
    } else {
      filename = `${name}.pdf`;
    }
  }

  const blob = await response.blob();
  return { blob, filename };
}

export async function downloadObsoleteMasterDocument(
  id: string | number,
  name: string
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/obsolete/${id}/download?type=master`
  );

  if (!response.ok) {
    throw new Error("Failed to download obsolete master document");
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `Master-${name}`;

  if (contentDisposition) {
    const filenameStarMatch = contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/
    );
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);

    if (filenameStarMatch) {
      filename = decodeURIComponent(filenameStarMatch[1]);
    } else if (filenameMatch) {
      filename = filenameMatch[1];
    }
  } else {
    const contentType = response.headers.get("Content-Type");
    if (contentType) {
      const ext = getExtFromMimeType(contentType);
      filename = `Master-${name}${ext}`;
    } else {
      filename = `Master-${name}.pdf`;
    }
  }

  const blob = await response.blob();
  return { blob, filename };
}

export async function getObsoleteDocumentPreview(
  id: string | number
): Promise<Blob> {
  // Use preview endpoint (only requires VIEW_OBSOLETE_DOCUMENTS permission)
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/obsolete/${id}/preview`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch obsolete document preview");
  }

  return response.blob();
}

export async function migrateDocuments(
  formData: FormData,
  onUploadProgress?: (progressEvent: ProgressEvent) => void
) {
  const response = await _uploadWithAuth(`${BASE_URL}/documents/migrate`, {
    method: "POST",
    body: formData,
    onUploadProgress,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to migrate documents");
  }

  const json: ApiResponse<Document[]> = await response.json();
  return json.data;
}

export async function getSharedDocuments(
  page: number,
  limit: number,
  departmentId?: string | number,
  search?: string,
  category?: string
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/shared?page=${page}&limit=${limit}${
      departmentId ? `&departmentId=${departmentId}` : ""
    }${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`
  );
  const json: {
    success: boolean;
    data: Document[];
    pagination: Pagination;
  } = await response.json();
  return {
    documents: json.data,
    pagination: json.pagination,
  };
}

export async function getDocumentHistory(
  id: string | number
): Promise<DocumentHistory[]> {
  const response = await _fetchWithAuth(`${BASE_URL}/documents/${id}/history`);
  const json: ApiResponse<DocumentHistory[]> = await response.json();
  return json.data;
}

export async function getDocumentHistoryPreview(
  historyId: number
): Promise<Blob> {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/history/${historyId}/preview`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch historical document preview");
  }

  return response.blob();
}

export async function downloadDocumentHistory(historyId: number, name: string) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/history/${historyId}/download`
  );

  if (!response.ok) {
    throw new Error("Failed to download historical document");
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = name;

  if (contentDisposition) {
    const filenameStarMatch = contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/
    );
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);

    if (filenameStarMatch) {
      filename = decodeURIComponent(filenameStarMatch[1]);
    } else if (filenameMatch) {
      filename = filenameMatch[1];
    }
  } else {
    const contentType = response.headers.get("Content-Type");
    if (contentType) {
      const ext = getExtFromMimeType(contentType);
      filename = `${name}${ext}`;
    } else {
      filename = `${name}.pdf`;
    }
  }

  const blob = await response.blob();
  return { blob, filename };
}

export async function downloadMasterDocumentHistory(
  historyId: number,
  name: string
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/history/${historyId}/download?type=master`
  );

  if (!response.ok) {
    throw new Error("Failed to download historical master document");
  }

  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `Master-${name}`;

  if (contentDisposition) {
    const filenameStarMatch = contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/
    );
    const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);

    if (filenameStarMatch) {
      filename = decodeURIComponent(filenameStarMatch[1]);
    } else if (filenameMatch) {
      filename = filenameMatch[1];
    }
  } else {
    const contentType = response.headers.get("Content-Type");
    if (contentType) {
      const ext = getExtFromMimeType(contentType);
      filename = `Master-${name}${ext}`;
    } else {
      filename = `Master-${name}.pdf`;
    }
  }

  const blob = await response.blob();
  return { blob, filename };
}

export async function requestPrint(
  id: string | number,
  data?: {
    reason: string;
    copies: number;
    storageLocation: string;
    isInternal: boolean;
  }
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/${id}/request-print`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Important for JSON body
      },
      body: JSON.stringify(data),
    }
  );
  const json: ApiResponse<any> = await response.json();
  return json;
}

export interface BulkRequestPrintData {
  documentIds: number[];
  reason: string;
  copies: number;
  storageLocation: string;
  distribution: "Internal" | "External";
}

export interface BulkRequestPrintResult {
  success: { documentId: number; documentName: string; documentCode: string; printRequestId: number; status: string }[];
  failed: { documentId: number; documentName: string; reason: string }[];
  skipped: { documentId: number; documentName: string; reason: string }[];
}

export async function bulkRequestPrint(data: BulkRequestPrintData) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/bulk-request-print`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  const json: ApiResponse<BulkRequestPrintResult> = await response.json();
  return json;
}

export async function getPrintRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
  documentId?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.status) query.append("status", params.status);
  if (params?.documentId)
    query.append("documentId", params.documentId.toString());

  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/print-requests?${query.toString()}`
  );

  const json: {
    success: boolean;
    data: PrintApproval[];
    pagination: Pagination;
  } = await response.json();

  return {
    approvals: json.data,
    pagination: json.pagination,
  };
}

// Get print history for a specific document (from print_request table)
export interface PrintHistoryItem {
  id: number;
  documentId: number;
  requesterId: number;
  status: string;
  reason?: string;
  copies: number;
  storageLocation?: string;
  isInternal: boolean;
  approvedBy?: number;
  approvedAt?: string;
  printedAt?: string;
  readyAt?: string;
  picTaken?: string;
  takenAt?: string;
  expiresAt?: string;
  createdAt: string;
  requester: {
    id: number;
    fullName: string;
    email: string;
  };
  approver?: {
    id: number;
    fullName: string;
  };
}

export async function getPrintHistory(
  documentId: string | number,
  params?: { page?: number; limit?: number }
) {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/${documentId}/print-history?${query.toString()}`
  );

  const json: {
    success: boolean;
    data: PrintHistoryItem[];
    pagination: Pagination;
  } = await response.json();

  return {
    requests: json.data,
    pagination: json.pagination,
  };
}

export async function getAllPrintHistory(params: {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number;
  status?: string;
  distribution?: string;
} = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.departmentId) queryParams.append("departmentId", params.departmentId.toString());
  if (params.status && params.status !== "all") queryParams.append("status", params.status);
  if (params.distribution && params.distribution !== "all") queryParams.append("distribution", params.distribution);

  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/print-history/all?${queryParams.toString()}`
  );

  const json: {
    success: boolean;
    data: any[];
    pagination: Pagination;
  } = await response.json();

  return {
    requests: json.data,
    pagination: json.pagination,
  };
}

export async function getPrintRequestById(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/documents/print-history/${id}`);
  const json: ApiResponse<any> = await response.json();
  return json.data;
}

// Updated: Approve print approval (uses print_approval ID now)
export async function approvePrintRequest(
  id: string | number,
  comments?: string
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/print-requests/${id}/approve`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comments }),
    }
  );
  return response.json();
}

// Updated: Reject print approval (uses print_approval ID now)
export async function rejectPrintRequest(id: string | number, reason: string) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/documents/print-requests/${id}/reject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }
  );
  return response.json();
}

// Master Document Index - Get all approved documents grouped by department and category
export async function getMasterDocumentIndex(
  year?: number,
  departmentId?: number,
  isInternal?: boolean,
  departmentIds?: number[]
) {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (departmentIds && departmentIds.length > 0) {
    params.append("departmentIds", departmentIds.join(","));
  } else if (departmentId) {
    params.append("departmentId", departmentId.toString());
  }
  if (isInternal !== undefined)
    params.append("isInternal", isInternal.toString());

  const url = `${BASE_URL}/documents/master-index${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  const response = await _fetchWithAuth(url);

  const json: {
    success: boolean;
    data: MasterDocumentIndex;
  } = await response.json();

  return json.data;
}

// Form Master Index - Get all approved Form documents with additional fields
export async function getFormMasterIndex(
  year?: number,
  departmentId?: number,
  isInternal?: boolean,
  departmentIds?: number[]
): Promise<FormMasterIndexData> {
  const params = new URLSearchParams();
  if (year) params.append("year", year.toString());
  if (departmentIds && departmentIds.length > 0) {
    params.append("departmentIds", departmentIds.join(","));
  } else if (departmentId) {
    params.append("departmentId", departmentId.toString());
  }
  if (isInternal !== undefined)
    params.append("isInternal", isInternal.toString());

  const url = `${BASE_URL}/documents/form-master-index${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  const response = await _fetchWithAuth(url);
  const json: ApiResponse<FormMasterIndexData> = await response.json();
  return json.data;
}

// External Master Index - Get all approved external documents with publisher, form, dates
export interface ExternalMasterDocument {
  no: number;
  id: number;
  name: string;
  publishingInstitution: string;
  documentFormat: string;
  dateOfIssue: string | null;
  expiredDate: string | null;
}

export interface ExternalMasterDepartment {
  department: {
    id: number;
    name: string;
    departmentCode: string;
  };
  documentType: string;
  documents: ExternalMasterDocument[];
}

export interface ExternalMasterIndexData {
  year: number;
  canPrint: boolean;
  canExport: boolean;
  departments: ExternalMasterDepartment[];
}

export async function getExternalMasterIndex(
  departmentId?: number,
  departmentIds?: number[]
): Promise<ExternalMasterIndexData> {
  const params = new URLSearchParams();
  if (departmentIds && departmentIds.length > 0) {
    params.append("departmentIds", departmentIds.join(","));
  } else if (departmentId) {
    params.append("departmentId", departmentId.toString());
  }

  const url = `${BASE_URL}/documents/external-master-index${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  const response = await _fetchWithAuth(url);
  const json: ApiResponse<ExternalMasterIndexData> = await response.json();
  return json.data;
}

/**
 * Upload a Work Instruction step image.
 * Image binary is stored in the database.
 * Returns the full backend URL to serve the image.
 */
export async function uploadWiImage(
  imageFile: File
): Promise<{ id: number; imageUrl: string }> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await _fetchWithAuth(`${BASE_URL}/documents/wi/upload-image`, {
    method: "POST",
    body: formData,
  });

  const json = await response.json();
  if (!json.success) throw new Error(json.message || "Failed to upload image");

  // Build full URL for <img src> usage
  const imageUrl = `${BASE_URL}/documents/wi/image/${json.data.id}`;
  return { id: json.data.id, imageUrl };
}
