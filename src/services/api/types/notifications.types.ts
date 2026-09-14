export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  documentId: number | null;
  isRead: boolean;
  createdAt: string;
  document?: {
    id: number;
    name: string;
    documentCode: string;
    status: string;
  };
}

export type NotificationType =
  | "approval_pending"
  | "document_approved"
  | "document_rejected"
  | "document_revised";

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export interface MarkAsReadResponse {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  documentId: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface MarkAllAsReadResponse {
  count: number;
}
