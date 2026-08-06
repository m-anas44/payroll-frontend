import { create } from "zustand";
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
  addDepartment: (dept: Omit<Department, "id" | "createdAt">) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Article Actions
  addArticle: (art: Omit<Article, "id" | "createdAt">) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  deleteArticle: (id: string) => void;

  // Operation Actions
  addOperation: (op: Omit<Operation, "id" | "createdAt">) => void;
  updateOperation: (id: string, updates: Partial<Operation>) => void;
  deleteOperation: (id: string) => void;

  // Piece Rate Actions
  addRate: (rate: Omit<PieceRate, "id" | "createdAt">, updatedBy?: string) => void;
  updateRate: (id: string, newRate: number, effectiveFrom: string, updatedBy?: string) => void;
  getApplicableRate: (operationId: string, dateStr: string) => number;

  // Settings Actions
  updateSettings: (newSettings: Partial<Settings>) => void;
}

export const useMasterDataStore = create<MasterDataState>((set, get) => ({
  departments: INITIAL_DEPARTMENTS,
  articles: INITIAL_ARTICLES,
  operations: INITIAL_OPERATIONS,
  rates: INITIAL_PIECE_RATES,
  rateHistory: [
    {
      id: "hist-1",
      operationId: "op-1",
      operationName: "Flash Cutting Upper",
      ratePerPiece: 45.0,
      effectiveFrom: "2026-01-01",
      updatedBy: "Admin",
      createdAt: "2026-01-01",
    },
    {
      id: "hist-2",
      operationId: "op-2",
      operationName: "Machine Trimming Edges",
      ratePerPiece: 28.5,
      effectiveFrom: "2026-01-01",
      updatedBy: "Admin",
      createdAt: "2026-01-01",
    },
  ],
  settings: {
    companyName: "Piece Rate Wagers Ltd.",
    companyAddress: "Industrial Area Kot Lakhpat, Lahore, Pakistan",
    phone: "+92 42 35880000",
    email: "info@piecerate.com",
    currencySymbol: "Rs.",
    autoApprovePayroll: false,
    allowUserEditProduction: true,
  },

  // Department Actions
  addDepartment: (dept) =>
    set((state) => ({
      departments: [
        ...state.departments,
        {
          ...dept,
          id: `dept-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
    })),
  updateDepartment: (id, updates) =>
    set((state) => ({
      departments: state.departments.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  deleteDepartment: (id) =>
    set((state) => ({
      departments: state.departments.filter((d) => d.id !== id),
    })),

  // Article Actions
  addArticle: (art) =>
    set((state) => ({
      articles: [
        ...state.articles,
        {
          ...art,
          id: `art-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
    })),
  updateArticle: (id, updates) =>
    set((state) => ({
      articles: state.articles.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  deleteArticle: (id) =>
    set((state) => ({
      articles: state.articles.filter((a) => a.id !== id),
    })),

  // Operation Actions
  addOperation: (op) =>
    set((state) => ({
      operations: [
        ...state.operations,
        {
          ...op,
          id: `op-${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ],
    })),
  updateOperation: (id, updates) =>
    set((state) => ({
      operations: state.operations.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    })),
  deleteOperation: (id) =>
    set((state) => ({
      operations: state.operations.filter((o) => o.id !== id),
    })),

  // Piece Rate Actions
  addRate: (rateData, updatedBy = "Admin") =>
    set((state) => {
      const newRate: PieceRate = {
        ...rateData,
        id: `rate-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      const op = state.operations.find((o) => o.id === rateData.operationId);
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

      const op = state.operations.find((o) => o.id === existing.operationId);

      // Close the previous rate effectiveTo date
      const updatedRates = state.rates.map((r) =>
        r.id === id
          ? {
              ...r,
              effectiveTo: effectiveFrom,
              status: "Superceded" as const,
            }
          : r
      );

      // Create new active rate
      const newRateRecord: PieceRate = {
        id: `rate-${Date.now()}`,
        operationId: existing.operationId,
        operationCode: existing.operationCode,
        operationName: existing.operationName,
        articleId: existing.articleId,
        articleName: existing.articleName,
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
    // Find rate active at the production date
    const sorted = rates
      .filter((r) => r.operationId === operationId && r.effectiveFrom <= dateStr)
      .sort((a, b) => (a.effectiveFrom > b.effectiveFrom ? -1 : 1));

    if (sorted.length > 0) {
      return sorted[0].ratePerPiece;
    }
    const fallback = rates.find((r) => r.operationId === operationId);
    return fallback ? fallback.ratePerPiece : 0;
  },

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
}));
