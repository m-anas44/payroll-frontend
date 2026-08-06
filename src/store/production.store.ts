import { create } from "zustand";
import { ProductionEntry, ProductionFilterState } from "@/types/production";
import { INITIAL_PRODUCTION_ENTRIES } from "@/data/production";
import { useMasterDataStore } from "./masterData.store";

interface ProductionState {
  entries: ProductionEntry[];
  filters: ProductionFilterState;

  setFilters: (filters: Partial<ProductionFilterState>) => void;
  resetFilters: () => void;

  addEntry: (
    entryData: Omit<ProductionEntry, "id" | "totalPayment" | "createdAt">
  ) => void;
  updateEntry: (id: string, updates: Partial<ProductionEntry>) => void;
  deleteEntry: (id: string) => void;
  bulkAddEntries: (newEntries: ProductionEntry[]) => void;
}

const initialFilters: ProductionFilterState = {
  startDate: "",
  endDate: "",
  workerId: "ALL",
  departmentId: "ALL",
  articleId: "ALL",
  operationId: "ALL",
  searchQuery: "",
};

export const useProductionStore = create<ProductionState>((set, get) => ({
  entries: INITIAL_PRODUCTION_ENTRIES,
  filters: initialFilters,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: initialFilters }),

  addEntry: (entryData) => {
    const masterData = useMasterDataStore.getState();
    const applicableRate =
      entryData.rateApplied ??
      masterData.getApplicableRate(entryData.operationId, entryData.date);

    const totalPayment = entryData.quantity * applicableRate;

    const newEntry: ProductionEntry = {
      ...entryData,
      id: `prod-${Date.now()}`,
      rateApplied: applicableRate,
      totalPayment,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      entries: [newEntry, ...state.entries],
    }));
  },

  updateEntry: (id, updates) => {
    const { entries } = get();
    const masterData = useMasterDataStore.getState();

    set({
      entries: entries.map((entry) => {
        if (entry.id !== id) return entry;

        const updatedDate = updates.date || entry.date;
        const updatedOpId = updates.operationId || entry.operationId;
        const updatedQty = updates.quantity !== undefined ? updates.quantity : entry.quantity;

        const rateApplied =
          updates.rateApplied !== undefined
            ? updates.rateApplied
            : masterData.getApplicableRate(updatedOpId, updatedDate);

        const totalPayment = updatedQty * rateApplied;

        return {
          ...entry,
          ...updates,
          rateApplied,
          totalPayment,
        };
      }),
    });
  },

  deleteEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),

  bulkAddEntries: (newEntries) =>
    set((state) => ({
      entries: [...newEntries, ...state.entries],
    })),
}));
