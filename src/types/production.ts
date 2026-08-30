export interface ProductionWorkerEntry {
  workerId: string;
  workerName?: string;
  quantity: number;
  effectiveRate: number;
  earnedAmount: number;
}

export interface ProductionEntry {
  _id: string;
  productionDate: string;
  appliedRate?: number;
  date?: string; // YYYY-MM-DD
  workerId?: string;
  workerName?: string;
  departmentId: string;
  departmentName?: string;
  articleId: string;
  articleNumber?: string;
  operationId: string;
  operationName?: string;
  quantity: number;
  totalAmount?: number;
  totalPayment?: number;
  workers?: ProductionWorkerEntry[];
  isGroupTask?: boolean;
  totalGroupQuantity?: number;
  notes?: string | null;
  createdBy?: string;
  enteredBy?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
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

