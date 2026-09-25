import { _fetchWithAuth, BASE_URL } from "./client";

export const getDashboardData = async (departmentId: string = "all") => {
  const response = await _fetchWithAuth(`${BASE_URL}/dashboard?departmentId=${departmentId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
};
