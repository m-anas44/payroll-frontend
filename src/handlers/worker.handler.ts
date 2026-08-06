import { Worker } from "@/types/worker";
import { useWorkerStore } from "@/store/worker.store";
import { isValidCNIC } from "@/lib/validators";

export const WorkerHandler = {
  getWorkers: () => {
    return useWorkerStore.getState().workers;
  },

  addWorker: (data: Omit<Worker, "id" | "workerCode" | "createdAt">) => {
    if (!data.name || !data.cnic || !data.departmentId) {
      return { success: false, message: "Name, CNIC, and Department are required." };
    }
    if (!isValidCNIC(data.cnic)) {
      return { success: false, message: "Invalid CNIC format. Expected format: 12345-1234567-1." };
    }
    return useWorkerStore.getState().addWorker(data);
  },

  updateWorker: (id: string, updates: Partial<Worker>) => {
    if (updates.cnic && !isValidCNIC(updates.cnic)) {
      return { success: false, message: "Invalid CNIC format." };
    }
    return useWorkerStore.getState().updateWorker(id, updates);
  },

  deleteWorker: (id: string) => {
    useWorkerStore.getState().deleteWorker(id);
    return { success: true, message: "Worker removed successfully." };
  },
};
