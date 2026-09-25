import { _fetchWithAuth, BASE_URL } from "./client";

export interface TicketCategory {
  id?: number;
  name: string;
  description?: string;
  parentId?: number | null;
  parent?: TicketCategory;
  children?: TicketCategory[];
  hierarchies?: any[];
}

export async function getTicketCategories() {
  const response = await _fetchWithAuth(`${BASE_URL}/ticket-categories`);
  const json = await response.json();
  return {
    ticketCategories: Array.isArray(json) ? json : (json.data || []),
  };
}

export async function getTicketCategoryByID(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/ticket-categories/${id}`);
  const json = await response.json();
  return json.data || json;
}

export async function createTicketCategory(category: TicketCategory) {
  const response = await _fetchWithAuth(`${BASE_URL}/ticket-categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });
  const json = await response.json();
  return json;
}

export async function updateTicketCategory(
  id: number | string,
  category: TicketCategory
) {
  const response = await _fetchWithAuth(`${BASE_URL}/ticket-categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || "Failed to update category");
  }
  return json;
}

export async function deleteTicketCategory(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/ticket-categories/${id}`, {
    method: "DELETE",
  });
  return response;
}
