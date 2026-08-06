export interface PieceRate {
  id: string;
  operationId: string;
  operationCode?: string;
  operationName?: string;
  articleId?: string;
  articleName?: string;
  ratePerPiece: number;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string; // YYYY-MM-DD or null if active
  notes?: string;
  status: "Active" | "Superceded";
  createdAt: string;
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
