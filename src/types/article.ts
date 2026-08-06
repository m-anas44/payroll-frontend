export interface Article {
  id: string;
  articleCode: string;
  name: string;
  category: string;
  season?: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt: string;
}
