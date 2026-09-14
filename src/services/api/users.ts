import { _fetchWithAuth, BASE_URL } from "./client";
import type { UserCreate } from "./types/user.types";

export async function getUsers(
  page: number = 1,
  limit: number = 10,
  search: string = ""
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/users?page=${page}&limit=${limit}&search=${search}`
  );
  const json = await response.json();
  return {
    users: json.data.users,
    pagination: json.data.pagination,
  };
}

export async function getUserDetail(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/users/${id}`);
  const json = await response.json();
  return json.data;
}

export async function addUser(user: UserCreate) {
  const response = await _fetchWithAuth(`${BASE_URL}/users/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  const json = await response.json();
  return json;
}

export async function updateUser(id: string, user: UserCreate) {
  const response = await _fetchWithAuth(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  const json = await response.json();
  return json;
}

export async function deleteUser(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/users/${id}`, {
    method: "DELETE",
  });
  const json = await response.json();
  return json;
}

export async function resetPassword(id: string | number, password: string) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/users/${id}/reset-password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newPassword: password }),
    }
  );
  const json = await response.json();
  return json;
}
