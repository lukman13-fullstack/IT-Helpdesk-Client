import { _fetchWithAuth, BASE_URL } from "./client";
import type {
  GetNotificationsParams,
  GetNotificationsResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
} from "./types/notifications.types";
import type { ApiResponse } from "./types/common.types";

export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<GetNotificationsResponse> {
  const { page = 1, limit = 20, unreadOnly = false } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(unreadOnly && { unreadOnly: "true" }),
  });

  const response = await _fetchWithAuth(
    `${BASE_URL}/notifications?${queryParams}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  const result: ApiResponse<GetNotificationsResponse> = await response.json();
  return result.data as GetNotificationsResponse;
}

export async function markNotificationAsRead(
  id: number
): Promise<MarkAsReadResponse> {
  const response = await _fetchWithAuth(
    `${BASE_URL}/notifications/${id}/read`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  const result: ApiResponse<MarkAsReadResponse> = await response.json();
  return result.data as MarkAsReadResponse;
}

export async function markAllNotificationsAsRead(): Promise<MarkAllAsReadResponse> {
  const response = await _fetchWithAuth(`${BASE_URL}/notifications/read-all`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }

  const result: ApiResponse<MarkAllAsReadResponse> = await response.json();
  return result.data as MarkAllAsReadResponse;
}
