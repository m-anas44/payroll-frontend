import { create } from "zustand";
import { Worker } from "@/types/worker";
import { INITIAL_WORKERS } from "@/data/workers";

interface WorkerState {
  workers: Worker[];
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;

  setSearchQuery: (query: string) => void;
  setDepartmentFilter: (deptId: string) => void;
  setStatusFilter: (status: string) => void;

  addWorker: (workerData: Omit<Worker, "id" | "workerCode" | "createdAt">) => { success: boolean; message: string };
  updateWorker: (id: string, updates: Partial<Worker>) => { success: boolean; message: string };
  deleteWorker: (id: string) => void;
  importWorkers: (importedWorkers: Omit<Worker, "id" | "createdAt">[]) => { imported: number; skipped: number };
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
  workers: INITIAL_WORKERS,
  searchQuery: "",
  departmentFilter: "ALL",
  statusFilter: "ALL",

  setSearchQuery: (query) => set({ searchQuery: query }),
  setDepartmentFilter: (deptId) => set({ departmentFilter: deptId }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  addWorker: (workerData) => {
    const { workers } = get();
    // Unique CNIC Validation (Business Rule)
    const normalizedCNIC = workerData.cnic.trim();
    const existingCNIC = workers.find(
      (w) => w.cnic.trim() === normalizedCNIC
    );
    if (existingCNIC) {
      return {
        success: false,
        message: `CNIC ${normalizedCNIC} already belongs to worker "${existingCNIC.name}" (${existingCNIC.workerCode}).`,
      };
    }

    const nextCodeNum = workers.length + 1001;
    const newWorker: Worker = {
      ...workerData,
      id: `wrk-${Date.now()}`,
      workerCode: `W-${nextCodeNum}`,
      createdAt: new Date().toISOString().split("T")[0],
    };

    set({ workers: [newWorker, ...workers] });
    return { success: true, message: "Worker registered successfully!" };
  },

  updateWorker: (id, updates) => {
    const { workers } = get();
    if (updates.cnic) {
      const normalizedCNIC = updates.cnic.trim();
      const existing = workers.find(
        (w) => w.id !== id && w.cnic.trim() === normalizedCNIC
      );
      if (existing) {
        return {
          success: false,
          message: `CNIC ${normalizedCNIC} is already assigned to ${existing.name}.`,
        };
      }
    }

    set({
      workers: workers.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    });
    return { success: true, message: "Worker profile updated." };
  },

  deleteWorker: (id) =>
    set((state) => ({
      workers: state.workers.filter((w) => w.id !== id),
    })),

  importWorkers: (importedWorkers) => {
    const { workers } = get();
    let imported = 0;
    let skipped = 0;
    const newWorkerList = [...workers];

    importedWorkers.forEach((wData) => {
      const cnicTrim = wData.cnic ? wData.cnic.trim() : "";
      if (!cnicTrim || newWorkerList.some((w) => w.cnic.trim() === cnicTrim)) {
        skipped++;
      } else {
        const nextCodeNum = newWorkerList.length + 1001;
        const w: Worker = {
          ...wData,
          id: `wrk-imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          workerCode: wData.workerCode || `W-${nextCodeNum}`,
          createdAt: new Date().toISOString().split("T")[0],
        };
        newWorkerList.push(w);
        imported++;
      }
    });

    set({ workers: newWorkerList });
    return { imported, skipped };
  },
}));
