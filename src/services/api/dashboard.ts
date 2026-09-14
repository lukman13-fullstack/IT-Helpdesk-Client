import { _fetchWithAuth, BASE_URL } from "./client";

export async function getDashboardData(departmentId?: string) {
  const query = departmentId ? `?departmentId=${departmentId}` : "";
  const response = await _fetchWithAuth(`${BASE_URL}/dashboard${query}`);
  const json = await response.json();
  return json.data;
}

export async function getQaPerformanceData(startDate?: string, endDate?: string) {
  let queryParams = new URLSearchParams();
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const response = await _fetchWithAuth(`${BASE_URL}/dashboard/qa-performance${query}`);
  const json = await response.json();
  return json.data;
}
