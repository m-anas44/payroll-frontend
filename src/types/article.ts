export interface Article {
  _id: string;
  articleNumber: string;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface GetArticlesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetArticlesResponse {
  items: Article[];
  total: number;
  page: number;
  limit: number;
}
