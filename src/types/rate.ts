export type RateStatus = "active" | "inactive" | "superseded";

export interface PieceRate {
  _id: string;
  departmentId: string;
  articleId: string;
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
