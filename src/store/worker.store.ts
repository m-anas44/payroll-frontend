import { create } from "zustand";

interface WorkerFilterState {
  searchQuery: string;
  departmentFilter: string;
  statusFilter: string;

  setSearchQuery: (query: string) => void;
  setDepartmentFilter: (deptId: string) => void;
  setStatusFilter: (status: string) => void;
  resetFilters: () => void;
}

export const useWorkerStore = create<WorkerFilterState>((set) => ({
  searchQuery: "",
  departmentFilter: "ALL",
  statusFilter: "ALL",

  setSearchQuery: (query) => set({ searchQuery: query }),
  setDepartmentFilter: (deptId) => set({ departmentFilter: deptId }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  resetFilters: () =>
    set({
      searchQuery: "",
      departmentFilter: "ALL",
      statusFilter: "ALL",
    }),
}));
