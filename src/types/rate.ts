export type RateStatus = "active" | "inactive" | "superseded";

export interface PieceRate {
  _id: string;
  departmentId: string;
  articleId: string;
  articleNumber: string;
  operationId: string;
  amount: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: RateStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RateListResponse {
  total: number;
  page: number;
  limit: number;
  items: PieceRate[];
}

export interface RateHistoryItem {
  id: string;
  operationId: string;
  operationName: string;
  ratePerPiece: number;
  effectiveFrom: string;
  effectiveTo?: string;
  updatedBy: string;
  createdAt: string;
}

export interface RateQueryParams {
  departmentId?: string;
  articleId?: string;
  operationId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface EffectiveRateParams {
  departmentId: string;
  articleId: string;
  operationId: string;
  date?: string;
}

export interface CreateRatePayload {
  departmentId: string;
  articleId: string;
  operationId: string;
  amount: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface UpdateRatePayload {
  amount?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  status?: string;
}
