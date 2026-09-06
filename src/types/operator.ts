export interface Operator {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "admin" | "operator";
  status: "active" | "inactive";
  departmentIds: string[];
  departmentNames?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOperatorData {
  name: string;
  email: string;
  password: string;
  departmentIds?: string[];
  status?: "active" | "inactive";
}

export interface UpdateOperatorData {
  name?: string;
  email?: string;
  password?: string;
  departmentIds?: string[];
  status?: "active" | "inactive";
}
