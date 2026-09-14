import { _fetchWithAuth, BASE_URL } from "./client";

export interface Draft {
  id: string;
  title: string | null;
  data: any;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: number;
    fullName: string;
    username: string;
  };
}

export const draftService = {
  getDrafts: async () => {
    const response = await _fetchWithAuth(`${BASE_URL}/drafts`);
    const json = await response.json();
    return json.data;
  },

  createDraft: async (title: string | null, data: any) => {
    const response = await _fetchWithAuth(`${BASE_URL}/drafts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, data }),
    });
    const json = await response.json();
    return json.data;
  },

  updateDraft: async (id: string, title: string | null, data: any) => {
    const response = await _fetchWithAuth(`${BASE_URL}/drafts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, data }),
    });
    const json = await response.json();
    return json.data;
  },

  deleteDraft: async (id: string) => {
    const response = await _fetchWithAuth(`${BASE_URL}/drafts/${id}`, {
      method: "DELETE",
    });
    const json = await response.json();
    return json;
  },
};
