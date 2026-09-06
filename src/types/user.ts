export type UserRole = "admin" | "operator";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentIds?: string[];
  active: boolean;
  createdAt: string;
}
