export interface Article {
  id: string;
  articleNumber: string;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt: string;
  updatedAt?: string;
}
