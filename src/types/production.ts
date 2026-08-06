export interface ProductionEntry {
  id: string;
  date: string; // YYYY-MM-DD
  workerId: string;
  workerName?: string;
  workerCode?: string;
  departmentId: string;
  departmentName?: string;
  articleId: string;
  articleName?: string;
  articleCode?: string;
  operationId: string;
  operationName?: string;
  operationCode?: string;
  quantity: number;
  rateApplied: number; // Rate at time of production
  totalPayment: number; // quantity * rateApplied
  remarks?: string;
  createdBy: string;
  createdAt: string;
}

export interface ProductionFilterState {
  startDate?: string;
  endDate?: string;
  workerId?: string;
  departmentId?: string;
  articleId?: string;
  operationId?: string;
  searchQuery?: string;
}
