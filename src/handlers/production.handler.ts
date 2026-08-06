import { ProductionEntry } from "@/types/production";
import { useProductionStore } from "@/store/production.store";

export const ProductionHandler = {
  getEntries: () => useProductionStore.getState().entries,

  addEntry: (data: Omit<ProductionEntry, "id" | "totalPayment" | "createdAt">) => {
    if (!data.workerId || !data.articleId || !data.operationId || data.quantity <= 0 || !data.date) {
      return { success: false, message: "Worker, Date, Article, Operation, and positive Quantity are required." };
    }
    useProductionStore.getState().addEntry(data);
    return { success: true, message: "Production record added." };
  },

  updateEntry: (id: string, updates: Partial<ProductionEntry>) => {
    useProductionStore.getState().updateEntry(id, updates);
    return { success: true, message: "Production record updated." };
  },

  deleteEntry: (id: string) => {
    useProductionStore.getState().deleteEntry(id);
    return { success: true, message: "Production entry deleted." };
  },
};
