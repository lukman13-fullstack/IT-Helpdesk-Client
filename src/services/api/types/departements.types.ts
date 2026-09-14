export interface Department {
  id?: string | number;
  name: string;
  status?: string;
  departmentCode: string;
  description?: string;
  hierarchies: Hierarchy[];
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    users: number;
  };
}

export interface Hierarchy {
  level: number;
  userId: number | null;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
}

export interface UserInDepartment {
  user: User;
}

export interface DepartmentDetail {
  id: number;
  name: string;
  status?: string;
  departmentCode: string;
  description: string;
  hierarchies: Hierarchy[];
  createdAt: string;
  updatedAt: string;
  users: UserInDepartment[];
}

export interface DepartmentDetailResponse {
  status: string;
  message: string;
  data: DepartmentDetail;
}
