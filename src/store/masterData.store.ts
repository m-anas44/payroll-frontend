import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Department } from "@/types/department";
import { Article } from "@/types/article";
import { Operation } from "@/types/operation";
import { PieceRate, RateHistoryItem } from "@/types/rate";
import { INITIAL_DEPARTMENTS } from "@/data/departments";
import { INITIAL_ARTICLES } from "@/data/articles";
import { INITIAL_OPERATIONS } from "@/data/operations";
import { INITIAL_PIECE_RATES } from "@/data/rates";

interface Settings {
  companyName: string;
  companyAddress: string;
  phone: string;
  email: string;
  currencySymbol: string;
  autoApprovePayroll: boolean;
  allowUserEditProduction: boolean;
}

interface MasterDataState {
  departments: Department[];
  articles: Article[];
  operations: Operation[];
  rates: PieceRate[];
  rateHistory: RateHistoryItem[];
  settings: Settings;

  // Department Actions
  addDepartment: (dept: Omit<Department, "_id" | "createdAt">) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Article Actions
  addArticle: (art: Omit<Article, "_id" | "createdAt">) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  deleteArticle: (id: string) => void;

  // Operation Actions
  addOperation: (op: Omit<Operation, "_id" | "createdAt">) => void;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  deleteOperation: (id: string) => void;

  // Piece Rate Actions
  addRate: (rate: Omit<PieceRate, "id" | "createdAt">, updatedBy?: string) => void;
  updateRate: (id: string, newRate: number, effectiveFrom: string, updatedBy?: string) => void;
  getApplicableRate: (operationId: string, dateStr: string) => number;

  // Settings Actions
  updateSettings: (newSettings: Partial<Settings>) => void;

  // Utility
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  companyName: "Askari Shoe Wagers Ltd.",
  companyAddress: "Industrial Area Kot Lakhpat, Lahore, Pakistan",
  phone: "+92 42 35880000",
  email: "info@piecerate.com",
  currencySymbol: "Rs.",
  autoApprovePayroll: false,
  allowUserEditProduction: true,
};

export const useMasterDataStore = create<MasterDataState>()(
  persist(
    (set, get) => ({
      departments: INITIAL_DEPARTMENTS,
      articles: INITIAL_ARTICLES,
      operations: INITIAL_OPERATIONS,
      rates: INITIAL_PIECE_RATES,
      rateHistory: [],
      settings: DEFAULT_SETTINGS,

      // Department Actions
      addDepartment: (dept) =>
        set((state) => ({
          departments: [
            ...state.departments,
            {
              ...dept,
              _id: `dept-${Date.now()}`,
              status: dept.status || "Active",
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateDepartment: (id, updates) =>
        set((state) => {
          const updatedDepts = state.departments.map((d) =>
            d._id === id ? { ...d, ...updates } : d
          );

          // Sync updated department name across dependent operations
          const updatedOps = updates.name
            ? state.operations.map((o) =>
                o.departmentId === id ? { ...o, departmentName: updates.name! } : o
              )
            : state.operations;

          return {
            departments: updatedDepts,
            operations: updatedOps,
          };
        }),

      deleteDepartment: (id) =>
        set((state) => ({
          departments: state.departments.filter((d) => d._id !== id),
          operations: state.operations.filter((o) => o.departmentId !== id),
        })),

      // Article Actions
      addArticle: (art) =>
        set((state) => ({
          articles: [
            ...state.articles,
            {
              ...art,
              _id: `art-${Date.now()}`,
              status: art.status || "Active",
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateArticle: (id, updates) =>
        set((state) => {
          const updatedArticles = state.articles.map((a) =>
            a._id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          );

          // Sync updated article number across operations & rates
          const updatedOperations = updates.articleNumber
            ? state.operations.map((o) =>
                o.articleId === id ? { ...o, articleNumber: updates.articleNumber! } : o
              )
            : state.operations;

          const updatedRates = updates.articleNumber || updates.name
            ? state.rates.map((r) =>
                r.articleId === id
                  ? {
                      ...r,
                      ...(updates.articleNumber && { articleNumber: updates.articleNumber }),
                      ...(updates.name && { articleName: updates.name }),
                    }
                  : r
              )
            : state.rates;

          return {
            articles: updatedArticles,
            operations: updatedOperations,
            rates: updatedRates,
          };
        }),

      deleteArticle: (id) =>
        set((state) => {
          const opsToRemove = state.operations
            .filter((o) => o.articleId === id)
            .map((o) => o._id);

          return {
            articles: state.articles.filter((a) => a._id !== id),
            operations: state.operations.filter((o) => o.articleId !== id),
            rates: state.rates.filter(
              (r) => r.articleId !== id && !opsToRemove.includes(r.operationId)
            ),
          };
        }),

      // Operation Actions
      addOperation: (op) =>
        set((state) => {
          const targetArticle = state.articles.find((a) => a._id === op.articleId);
          const targetDept = state.departments.find((d) => d._id === op.departmentId);

          const newOp: Operation = {
            ...op,
            _id: `op-${Date.now()}`,
            articleNumber: targetArticle?.articleNumber || op.articleNumber || "",
            departmentName: targetDept?.name || op.departmentName || "",
            status: op.status || "Active",
            createdAt: new Date().toISOString(),
          };

          return {
            operations: [...state.operations, newOp],
          };
        }),

      updateOperation: (id, updates) =>
        set((state) => {
          const updatedOps = state.operations.map((o) =>
            o._id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
          );

          const updatedRates = updates.name || updates.code
            ? state.rates.map((r) =>
                r.operationId === id
                  ? {
                      ...r,
                      ...(updates.name && { operationName: updates.name }),
                      ...(updates.code && { operationCode: updates.code }),
                    }
                  : r
              )
            : state.rates;

          return {
            operations: updatedOps,
            rates: updatedRates,
          };
        }),

      deleteOperation: (id) =>
        set((state) => ({
          operations: state.operations.filter((o) => o._id !== id),
          rates: state.rates.filter((r) => r.operationId !== id),
        })),

      // Piece Rate Actions
      addRate: (rateData, updatedBy = "Admin") =>
        set((state) => {
          const newRate: PieceRate = {
            ...rateData,
            id: `rate-${Date.now()}`,
            createdAt: new Date().toISOString().split("T")[0],
          };

          const op = state.operations.find((o) => o._id === rateData.operationId);
          const historyItem: RateHistoryItem = {
            id: `hist-${Date.now()}`,
            operationId: rateData.operationId,
            operationName: op?.name || rateData.operationName || "Operation",
            ratePerPiece: rateData.ratePerPiece,
            effectiveFrom: rateData.effectiveFrom,
            updatedBy,
            createdAt: new Date().toISOString().split("T")[0],
          };

          return {
            rates: [...state.rates, newRate],
            rateHistory: [historyItem, ...state.rateHistory],
          };
        }),

      updateRate: (id, newRate, effectiveFrom, updatedBy = "Admin") =>
        set((state) => {
          const existing = state.rates.find((r) => r.id === id);
          if (!existing) return state;

          const op = state.operations.find((o) => o._id === existing.operationId);

          const updatedRates = state.rates.map((r) =>
            r.id === id
              ? {
                  ...r,
                  effectiveTo: effectiveFrom,
                  status: "Superceded" as const,
                }
              : r
          );

          const newRateRecord: PieceRate = {
            id: `rate-${Date.now()}`,
            operationId: existing.operationId,
            operationCode: existing.operationCode,
            operationName: existing.operationName,
            articleId: existing.articleId,
            // articleNumber: existing.articleNumber,
            ratePerPiece: newRate,
            effectiveFrom,
            notes: `Updated from Rs. ${existing.ratePerPiece} on ${effectiveFrom}`,
            status: "Active",
            createdAt: new Date().toISOString().split("T")[0],
          };

          const historyItem: RateHistoryItem = {
            id: `hist-${Date.now()}`,
            operationId: existing.operationId,
            operationName: op?.name || existing.operationName || "Operation",
            ratePerPiece: newRate,
            effectiveFrom,
            updatedBy,
            createdAt: new Date().toISOString().split("T")[0],
          };

          return {
            rates: [newRateRecord, ...updatedRates],
            rateHistory: [historyItem, ...state.rateHistory],
          };
        }),

      getApplicableRate: (operationId: string, dateStr: string) => {
        const { rates } = get();

        const validRates = rates.filter((r) => {
          if (r.operationId !== operationId) return false;
          const isAfterStart = r.effectiveFrom <= dateStr;
          const isBeforeEnd = !r.effectiveTo || r.effectiveTo >= dateStr;
          return isAfterStart && isBeforeEnd;
        });

        if (validRates.length > 0) {
          validRates.sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
          return validRates[0].ratePerPiece;
        }

        const fallback = rates
          .filter((r) => r.operationId === operationId)
          .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];

        return fallback ? fallback.ratePerPiece : 0;
      },

      // Settings Actions
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      // Reset utility
      resetToDefaults: () =>
        set({
          departments: INITIAL_DEPARTMENTS,
          articles: INITIAL_ARTICLES,
          operations: INITIAL_OPERATIONS,
          rates: INITIAL_PIECE_RATES,
          rateHistory: [],
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: "master-data-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);