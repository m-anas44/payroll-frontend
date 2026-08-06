export type UserRole = "Admin" | "Worker";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  active: boolean;
  createdAt: string;
}
