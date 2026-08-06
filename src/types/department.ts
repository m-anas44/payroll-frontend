export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
  workerCount?: number;
  createdAt: string;
}
