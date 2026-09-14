// Document Types
export type DocumentCategory =
  | "form"
  | "standard"
  | "instruksi_kerja"
  | "prosedur"
  | "manual_perusahaan"
  | "manual_halal"
  | "external"
  | "";

export type DocumentStatus = "draft" | "pending" | "approved" | "rejected";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "all";

export type DocumentFormat =
  | "digital_document"
  | "hard_document"
  | "digital_and_hard_document";

export interface Department {
  id: number;
  name: string;
  departmentCode: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string | null;
  position: string | null;
}

export interface Approval {
  id: number;
  level: number;
  status: ApprovalStatus;
  comments?: string;
  reason?: string; // Revision purpose
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  approver: User;
}

export interface DocumentHistory {
  id: number | null; // null for current document
  documentId: number;
  name: string;
  description: string | null;
  version: number;
  revision: number;
  googleDriveFileId: string;
  filePath: string | null;
  fileSize: number;
  mimeType: string;
  masterDocumentGoogleDriveId: string | null;
  masterDocumentPath: string | null;
  masterDocumentFileSize: number | null;
  masterDocumentMimeType: string | null;
  changeDescription: string | null;
  revisionPurpose?: string | null;
  changedBy: number | null; // null for current document
  createdAt: string;
  releaseDate: string | null;
  changer: User | null; // null for current document
  isCurrent?: boolean; // true for current document
}

// Keep for backward compatibility
export interface HistoryItem {
  id: number;
  action: string;
  createdAt: string;
  createdBy?: User;
}

export interface ApprovalProgressStep {
  id: string;
  title: string;
  approverName: string;
  status: "pending" | "approved" | "rejected" | "waiting";
  isMandatory: boolean;
}

export interface ApprovalProgress {
  percentage: number;
  completedSteps: number;
  totalSteps: number;
  steps: ApprovalProgressStep[];
}

export interface Document {
  id: number;
  name: string;
  description?: string;
  documentCode: string;
  documentNumber: number;
  category: DocumentCategory;
  isInternal: boolean;
  isPublished: boolean;
  deletionReason?: string;
  proposalObjective?: string;
  googleDriveFileId: string;
  fileSize: number;
  mimeType: string;
  masterDocumentGoogleDriveId?: string;
  masterDocumentPath?: string;
  masterDocumentFileSize?: number;
  masterDocumentMimeType?: string;
  departmentId: number;
  history?: HistoryItem[];
  uploadedBy: number;
  version: number;
  revision: number;
  status: DocumentStatus;
  releaseDate?: string;
  createdAt: string;
  updatedAt: string;
  documentFormat?: DocumentFormat;
  retentionPeriod?: string;
  hardDocumentRetentionPeriod?: string;
  storageLocation?: string;
  hardDocumentStorageLocation?: string;
  remark?: string;
  publishingInstitution?: string;
  dateOfIssue?: string;
  expiredDate?: string;
  documentStoragePeriod?: number;
  department?: Department;
  uploader?: User;
  approvals?: Approval[];
  approvalProgress?: ApprovalProgress;
  workInstructionTemplates?: any[];
}

export interface DocumentReferenceLink {
  id: number;
  reference: {
    id: number;
    name: string;
    code: string;
    description?: string;
    checker?: {
      id: number;
      fullName: string;
    };
  };
}

export interface DocumentDetail extends Document {
  department: Department;
  uploader: User;
  approvals: Approval[];
  printRequestStatus?: "pending" | "approved" | "rejected" | "expired" | null;
  printRequests?: PrintRequest[];
  pendingPrintRequests?: PendingPrintRequest[];
  hasActivePrintRequests?: boolean;
  canRequestMore?: boolean;
  references?: DocumentReferenceLink[];
  workInstructionTemplates?: any[];
}

export interface PrintRequest {
  id: number;
  isInternal: boolean;
  approvedAt: string;
  expiresAt: string;
  printedAt?: string | null;
  type: "controlled" | "uncontrolled";
}

export interface PendingPrintRequest {
  id: number;
  isInternal: boolean;
  createdAt: string;
  type: "controlled" | "uncontrolled";
}

// New API structure - print approvals with nested print request data
export interface PrintApproval {
  id: number;
  printRequestId: number;
  approverId: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  comments?: string;
  approvedAt?: string;
  createdAt: string;
  printRequest: {
    id: number;
    documentId: number;
    status: string;
    reason?: string;
    copies: number;
    storageLocation?: string;
    isInternal: boolean;
    createdAt: string;
    document: {
      id: number;
      name: string;
      documentCode: string;
    };
    requester: {
      id: number;
      fullName: string;
      email: string;
    };
  };
}

export interface ApprovalRequest {
  id: number | string;
  documentId?: number;
  document?: Document;
  approver?: User;
  creator?: User;
  level?: number;
  status: ApprovalStatus;
  comments?: string | null;
  reason?: string | null; // For deletion requests
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string | null;
  approvedBy?: number | null;
  approvedByUser?: User | null;
  isPrintRequest?: boolean;
  isReferenceCheck?: boolean;
  type?: string;
  originalId?: number;
  reference?: any;
  canAct?: boolean;
  hasPendingHierarchy?: boolean;
  printApproval?: any;
  printRequest?: any; // Print request details for print approval
  referenceType?: string;
  checker?: User;
  approverId?: number;
  documentRevision?: number; // Tracks which document revision this approval is for
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Request Types
export interface GetDocumentsParams {
  page?: number;
  limit?: number;
  departmentId?: number;
  status?: DocumentStatus;
  category?: DocumentCategory;
  search?: string;
  destination?: string;
}

export interface CreateDocumentData {
  name: string;
  description?: string;
  category?: DocumentCategory; // Optional - not required for External documents
  file?: File; // Optional if external
  isInternal: boolean;
  proposalObjective?: string;
  masterDocumentFile?: File; // Optional if external
  documentFormat?: DocumentFormat;
  retentionPeriod?: string;
  hardDocumentRetentionPeriod?: string;
  storageLocation?: string;
  hardDocumentStorageLocation?: string;
  remark?: string;
  publishingInstitution?: string;
  dateOfIssue?: string;
  expiredDate?: string;
  documentStoragePeriod?: number;
  referenceIds?: number[];
  destination?: string;
  templateData?: string;
}

export interface UpdateDocumentData {
  name?: string;
  description?: string;
  category?: DocumentCategory;
  isInternal?: boolean;
  proposalObjective?: string;
  file?: File;
  masterDocumentFile?: File;
  remark?: string;
  documentFormat?: DocumentFormat;
  retentionPeriod?: string;
  hardDocumentRetentionPeriod?: string;
  storageLocation?: string;
  hardDocumentStorageLocation?: string;
  publishingInstitution?: string;
  dateOfIssue?: string;
  expiredDate?: string;
  templateData?: string;
  referenceIds?: number[];
}

export interface ReviseDocumentData {
  changeDescription: string;
  revisionPurpose?: string; // Purpose shown in approval list
  name?: string; // Edit document name during revision
  file?: File;
  masterDocumentFile?: File;
  documentFormat?: DocumentFormat;
  retentionPeriod?: string;
  storageLocation?: string;
  remark?: string;
  templateData?: string; // JSON string for WI template revisions
  publishingInstitution?: string;
  dateOfIssue?: string;
  expiredDate?: string;
  referenceIds?: number[];
}

export interface ApprovalActionData {
  comments?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export interface DocumentsResponse extends Array<Document> {}

export interface DocumentsWithPagination {
  documents: Document[];
  pagination: Pagination;
}

// Form Master Index Types
export interface FormMasterDocument {
  no: number;
  id: number;
  name: string;
  documentCode: string;
  documentNumber: number;
  revision: number;
  dateOfIssue: string | null;
  releaseDate: string;
  documentFormat?: DocumentFormat;
  documentTypeLabel?: string;
  retentionPeriod?: string;
  storageLocation?: string;
}

export interface FormMasterDepartment {
  department: {
    id: number;
    name: string;
    code: string;
  };
  documents: FormMasterDocument[];
}

export interface FormMasterIndexData {
  year: number;
  canPrint: boolean;
  canExport: boolean;
  departments: FormMasterDepartment[];
}

export interface ApprovalRequestsResponse extends Array<ApprovalRequest> {}

export interface ApprovalActionResponse {
  approval: Approval;
  document: {
    id: number;
    status: DocumentStatus;
  };
  allApproved: boolean;
}

// Master Document Index Types
export interface MasterDocumentIndexItem {
  no: number;
  id: number;
  name: string;
  documentCode: string;
  revision: number;
  dateOfIssue: string | null;
  releaseDate: string | null;
  updatedAt: string;
}

export interface MasterDocumentIndexCategory {
  category: string;
  label: string;
  documents: MasterDocumentIndexItem[];
}

export interface MasterDocumentIndexDepartment {
  department: {
    id: number;
    name: string;
    departmentCode: string;
  };
  documentType: string;
  categories: MasterDocumentIndexCategory[];
}

export interface MasterDocumentIndex {
  year: number;
  canPrint: boolean;
  canExport: boolean;
  departments: MasterDocumentIndexDepartment[];
}
