import { _fetchWithAuth, BASE_URL } from "./client";
import type { Department } from "./types/departements.types";

export async function getDepartments(
  page: number = 1,
  limit: number = 10,
  search: string = ""
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/departments?page=${page}&limit=${limit}&search=${search}`
  );
  const json = await response.json();
  return {
    departments: json.data.departments,
    pagination: json.data.pagination,
  };
}

export async function getDepartmentByID(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/departments/${id}`);
  const json = await response.json();
  return json.data;
}

export async function createDepartment(department: Department) {
  const body = {
    name: department.name,
    departmentCode: department.departmentCode,
    description: department.description,
    hierarchies: department.hierarchies,
  };
  console.log("API createDepartment - Request body:", body);
  const response = await _fetchWithAuth(`${BASE_URL}/departments/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  return json;
}

export async function updateDepartment(
  id: number | string,
  department: Department
) {
  const body = {
    name: department.name,
    departmentCode: department.departmentCode,
    description: department.description,
    hierarchies: department.hierarchies,
  };
  console.log("API updateDepartment - Request body:", body);
  const response = await _fetchWithAuth(`${BASE_URL}/departments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  return json;
}

export async function deleteDepartment(id: string | number) {
  const response = await _fetchWithAuth(`${BASE_URL}/departments/${id}`, {
    method: "DELETE",
  });
  return response;
}

// ============================================================================
// Category Hierarchy API Functions
// ============================================================================

export interface CategoryHierarchy {
  id: number;
  level: number;
  userId: number;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface CategoryHierarchiesResponse {
  [category: string]: CategoryHierarchy[];
}

export async function getCategoryHierarchies(departmentId: string | number) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/departments/${departmentId}/category-hierarchies`
  );
  const json = await response.json();
  return json.data as CategoryHierarchiesResponse;
}

export async function saveCategoryHierarchy(
  departmentId: string | number,
  category: string,
  hierarchies: { level: number; userId: number }[]
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/departments/${departmentId}/category-hierarchies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category, hierarchies }),
    }
  );
  const json = await response.json();
  return json;
}

export async function deleteCategoryHierarchy(
  departmentId: string | number,
  category: string
) {
  const response = await _fetchWithAuth(
    `${BASE_URL}/departments/${departmentId}/category-hierarchies/${category}`,
    {
      method: "DELETE",
    }
  );
  const json = await response.json();
  return json;
}

