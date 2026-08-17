export interface Operation {
  id: string;
  code?: string;
  name: string;
  articleId: string;
  articleName: string;
  departmentId: string;
  departmentName: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt?: string;
}
