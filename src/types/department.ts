export interface Department {
  _id: string;
  code: string;
  name: string;
  description?: string;
  status?: "active" | "inactive";
  workerCount?: number;
  createdAt?: string;
}
