"use client";

import React, { useEffect, useState, useCallback } from "react";
import ProductionFilter from "@/components/production/ProductionFilter";
import ProductionTable from "@/components/production/ProductionTable";
import BatchProductionModal from "@/components/production/BatchProductionModal";
import { Layers, Loader2, AlertCircle } from "lucide-react";
import { getProductionEntries } from "@/handlers/production.handler";
import { getWorkers } from "@/handlers/worker.handler";
import { getDepartments } from "@/handlers/department.handler";
import { getArticles } from "@/handlers/article.handler";
import { getOperations } from "@/handlers/operation.handler";

import { ProductionEntry } from "@/types/production";
import { Worker } from "@/types/worker";
import { Department } from "@/types/department";
import { Article } from "@/types/article";
import { Operation } from "@/types/operation";

const INITIAL_FILTERS = {
  searchQuery: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  departmentId: "",
  workerId: "",
  articleId: "",
  operationId: "",
};

export default function ProductionPage() {
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  
  const [entries, setEntries] = useState<ProductionEntry[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLookup, setIsLoadingLookup] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const fetchLookupData = async () => {
    setIsLoadingLookup(true);
    try {
      const [workersRes, departmentsRes, articlesRes, operationsRes] =
        await Promise.all([
          getWorkers({ status: "active" }),
          getDepartments(),
          getArticles(),
          getOperations(),
        ]);

      const safeWorkers = workersRes.items || workersRes || [];
      const safeDepartments = departmentsRes || departmentsRes || [];
      const safeArticles = articlesRes.items || articlesRes || [];
      const safeOperations = operationsRes.items || operationsRes || [];

      setWorkers(
        safeWorkers.map((worker: any) => ({
          _id: String(worker._id),
          name: worker.name,
          departmentId: worker.departmentId ? String(worker.departmentId) : undefined,
        }))
      );
      
      setDepartments(
        safeDepartments.map((dept: any) => ({
          _id: String(dept._id),
          name: dept.name,
          code: dept.code,
        }))
      );
      
      setArticles(
        safeArticles.map((article: any) => ({
          _id: String(article._id),
          name: article.name,
          articleNumber: article.articleNumber,
          status: article.status
        }))
      );
      
      setOperations(
        safeOperations.map((operation: any) => ({
          _id: String(operation._id),
          code: operation.code,
          name: operation.name,
        }))
      );
    } catch (err: any) {
      console.error("Failed to load lookup data:", err);
      setError("Failed to load dropdown data. Please refresh the page.");
    } finally {
      setIsLoadingLookup(false);
    }
  };

  const loadProductionData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "" && value !== "ALL")
      );

      const response = await getProductionEntries(activeFilters);
      const rawEntries = response.items || response || [];

      const mappedEntries: ProductionEntry[] = rawEntries.map((entry: any) => ({
        ...entry,
        id: entry._id || entry.id || "temp-id",
        date: entry.productionDate || entry.date || "",
        rateApplied: entry.rate || 0,
        totalPayment: entry.totalAmount || 0,
        createdBy: entry.createdBy || "System"
      }));

      setEntries(mappedEntries);
    } catch (err: any) {
      setError("Failed to load production records.");
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLookupData();
  }, []);

  useEffect(() => {
    loadProductionData();
  }, [loadProductionData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Production Entry</h1>
          <p className="text-sm text-slate-500">Record and manage daily piece-rate production for Askari Shoe.</p>
        </div>
        <button
          onClick={() => setIsBatchModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Layers className="h-4 w-4" />
          Batch Production
        </button>
      </div>

      <ProductionFilter 
        filters={filters} 
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        workers={workers}
        departments={departments}
        articles={articles}
        operations={operations}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <ProductionTable 
          entries={entries} 
          workers={workers}
          departments={departments}
          articles={articles}
          operations={operations}
          onRefresh={loadProductionData} 
        />
      )}

      <BatchProductionModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSuccess={loadProductionData}
        workers={workers}
        departments={departments}
        articles={articles}
        operations={operations}
        isLoadingData={isLoadingLookup}
      />
    </div>
  );
}