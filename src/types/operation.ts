export interface Operation {
  _id: string;
  code?: string;
  name: string;
  articleId: string;
  articleNumber: string;
  departmentId: string;
  departmentName: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt?: string;
}
