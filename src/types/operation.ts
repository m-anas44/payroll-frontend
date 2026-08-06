export interface Operation {
  id: string;
  operationCode: string;
  name: string;
  articleId: string;
  articleCode?: string;
  articleName?: string;
  departmentId: string;
  departmentName?: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}
