import type { Notification } from "@/services/api/types/notifications.types";

export interface NotificationsState {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface NotificationsAction {
  type: string;
  payload?: any;
}
