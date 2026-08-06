import { PieceRate } from "@/types/rate";
import { useMasterDataStore } from "@/store/masterData.store";

export const RateHandler = {
  getRates: () => useMasterDataStore.getState().rates,
  getRateHistory: () => useMasterDataStore.getState().rateHistory,

  addRate: (rateData: Omit<PieceRate, "id" | "createdAt">, updatedBy = "Admin") => {
    if (!rateData.operationId || rateData.ratePerPiece <= 0 || !rateData.effectiveFrom) {
      return { success: false, message: "Operation, positive rate, and effective date are required." };
    }
    useMasterDataStore.getState().addRate(rateData, updatedBy);
    return { success: true, message: "Piece rate created." };
  },

  updateRate: (id: string, newRate: number, effectiveFrom: string, updatedBy = "Admin") => {
    if (newRate <= 0 || !effectiveFrom) {
      return { success: false, message: "Please provide a valid rate and effective date." };
    }
    useMasterDataStore.getState().updateRate(id, newRate, effectiveFrom, updatedBy);
    return { success: true, message: "Piece rate updated and previous rate version archived." };
  },
};
