export interface Operation {
  id: string;
  code?: string;
  name: string;
  articleId: string;
  departmentId: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt?: string;
}
