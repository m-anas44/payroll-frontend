export interface ProductionEntry {
  totalAmount(totalAmount: any): unknown;
  _id: string;
  productionDate: string;
  appliedRate: number;
  id: string;
  date: string; // YYYY-MM-DD
  workerId: string;
  workerName?: string;
  departmentId: string;
  departmentName?: string;
  articleId: string;
  articleNumber?: string;
  operationId: string;
  operationName?: string;
  quantity: number;
  totalPayment: number; // quantity * rateApplied
  notes?: string;
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
