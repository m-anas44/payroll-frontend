export interface Operation {
  _id: string;
  code?: string;
  name: string;
  departmentId: string;
  departmentName: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt?: string;
}
