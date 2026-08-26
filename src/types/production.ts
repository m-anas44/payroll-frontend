export interface ProductionEntry {
  totalAmount(totalAmount: any): unknown;
  _id: string;
  productionDate: string;
  appliedRate: number;
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
  status: string | undefined;
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  workerId?: string;
  departmentId?: string;
  articleId?: string;
  operationId?: string;
  searchQuery?: string;
}
