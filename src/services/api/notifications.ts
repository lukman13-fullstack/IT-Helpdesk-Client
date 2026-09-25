import { _fetchWithAuth, BASE_URL } from "./client";

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await _fetchWithAuth(`${BASE_URL}/notifications`);
  if (!response.ok) throw new Error("Failed to fetch notifications");
  return response.json();
}

export async function markAsRead(id: number | 'all'): Promise<void> {
  const response = await _fetchWithAuth(`${BASE_URL}/notifications/${id}/read`, {
    method: "PUT"
  });
  if (!response.ok) throw new Error("Failed to mark as read");
}
