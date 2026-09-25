import { _fetchWithAuth, BASE_URL } from "./client";
import { TicketCategory } from "./ticketCategories";

export interface TicketComment {
  id: number;
  ticketId: number;
  userId: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    username: string;
  };
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_FOR_USER" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  categoryId: number;
  departmentId?: number | null;
  requesterId: number;
  assigneeId?: number | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
  
  requester?: { id: number; fullName: string; username: string };
  assignee?: { id: number; fullName: string; username: string };
  category?: TicketCategory;
  department?: any;
  comments?: TicketComment[];
}

export async function getTickets() {
  const response = await _fetchWithAuth(`${BASE_URL}/tickets`);
  if (!response.ok) throw new Error("Failed to fetch tickets");
  const json = await response.json();
  return Array.isArray(json) ? json : (json.data || []);
}

export async function getTicketByID(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/tickets/${id}`);
  if (!response.ok) throw new Error("Failed to fetch ticket");
  const json = await response.json();
  return json.data || json;
}

export async function createTicket(ticket: any) {
  const response = await _fetchWithAuth(`${BASE_URL}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to create ticket");
  }
  const json = await response.json();
  return json;
}

export async function updateTicket(
  id: number | string,
  ticket: any
) {
  const response = await _fetchWithAuth(`${BASE_URL}/tickets/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticket),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to update ticket");
  }
  const json = await response.json();
  return json;
}

export async function addTicketComment(id: number | string, content: string) {
  const response = await _fetchWithAuth(`${BASE_URL}/tickets/${id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Failed to add comment");
  }
  const json = await response.json();
  return json;
}
