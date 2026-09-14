import { _fetchWithAuth, BASE_URL } from "./client";
import type { RoleCreate, RoleUpdate } from "./types/roles.types";

export async function getRoles(
  page: number = 1,
  limit: number = 10,
  search: string = ""
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/roles?page=${page}&limit=${limit}&search=${search}`
  );
  const json = await response.json();
  return {
    roles: json.data.roles,
    pagination: json.data.pagination,
  };
}

export async function getRoleById(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/roles/${id}`);
  const json = await response.json();
  return json.data;
}

export async function createRole(role: RoleCreate) {
  const response = await _fetchWithAuth(`${BASE_URL}/roles/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(role),
  });
  const json = await response.json();
  return json;
}
export async function updateRole(id: string | number, role: RoleUpdate) {
  const response = await _fetchWithAuth(`${BASE_URL}/roles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(role),
  });
  const json = await response.json();
  return json;
}

export async function deleteRole(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/roles/${id}`, {
    method: "DELETE",
  });
  const json = await response.json();
  return json;
}

export async function getAllPermissions() {
  const response = await _fetchWithAuth(`${BASE_URL}/roles/permissions`);
  const json = await response.json();
  return json.data;
}
