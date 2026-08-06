import { Operation } from "@/types/operation";
import { useMasterDataStore } from "@/store/masterData.store";

export const OperationHandler = {
  getOperations: () => useMasterDataStore.getState().operations,

  addOperation: (data: Omit<Operation, "id" | "createdAt">) => {
    if (!data.operationCode || !data.name || !data.articleId || !data.departmentId) {
      return { success: false, message: "Code, Name, Article, and Department are required." };
    }
    useMasterDataStore.getState().addOperation(data);
    return { success: true, message: "Operation created." };
  },

  updateOperation: (id: string, updates: Partial<Operation>) => {
    useMasterDataStore.getState().updateOperation(id, updates);
    return { success: true, message: "Operation updated." };
  },

  deleteOperation: (id: string) => {
    useMasterDataStore.getState().deleteOperation(id);
    return { success: true, message: "Operation removed." };
  },
};
