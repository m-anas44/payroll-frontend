export interface ProductionWorkerInputPayload {
  workerId: string;
  quantity?: number;
  effectiveRate?: number;
  earnedAmount?: number;
}

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
  rateApplied?: number;
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

export interface ProductionListResponse {
  items: ProductionEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductionQueryParams {
  startDate?: string;
  endDate?: string;
  workerId?: string;
  departmentId?: string;
  articleId?: string;
  operationId?: string;
  status?: string;
  enteredBy?: string;
  page?: number;
  limit?: number;
}

export interface ProductionUpdatePayload {
  articleId?: string;
  operationId?: string;
  quantity?: number;
  productionDate?: string;
  notes?: string;
  status?: string;
  workers?: ProductionWorkerInputPayload[];
  isGroupTask?: boolean;
  totalGroupQuantity?: number;
  splitMode?: "equal" | "custom";
}

export interface ProductionStatusUpdatePayload {
  status: string;
  entryIds: string[];
}

export interface ProductionBatchItemPayload {
  workerId?: string;
  workers?: ProductionWorkerInputPayload[];
  departmentId: string;
  articleId: string;
  operationId: string;
  quantity?: number;
  isGroupTask?: boolean;
  totalGroupQuantity?: number;
  splitMode?: "equal" | "custom";
  notes?: string;
}

export interface ProductionBatchPayload {
  productionDate: string;
  items: ProductionBatchItemPayload[];
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
