import { browserClient as axios } from "@/lib/browserClient";
import { useProductionStore } from "@/store/production.store";
import { useWorkerStore } from "@/store/worker.store";
import { useMasterDataStore } from "@/store/masterData.store";
import { usePayrollStore } from "@/store/payroll.store";
import {
  LabourWiseReportRow,
  DepartmentWiseReportRow,
  MonthlyPayrollReportRow,
} from "@/types/report";

export const ReportHandler = {
  // Legacy frontend-based reports (keeping for backward compatibility)
  getLabourWiseReport: (month?: string): LabourWiseReportRow[] => {
    const entries = useProductionStore.getState().entries;
    const workers = useWorkerStore.getState().workers;

    const filtered = month ? entries.filter((e) => e.date.startsWith(month)) : entries;

    const workerMap = new Map<string, LabourWiseReportRow>();

    filtered.forEach((entry) => {
      const worker = workers.find((w) => w.id === entry.workerId);
      const existing = workerMap.get(entry.workerId);

      const opName = entry.operationName || "Operation";
      const qty = entry.quantity;
      const earned = entry.totalPayment;

      if (existing) {
        existing.totalPieces += qty;
        existing.totalEarned += earned;
        const opIndex = existing.operationsBreakdown.findIndex(
          (o) => o.operationName === opName
        );
        if (opIndex >= 0) {
          existing.operationsBreakdown[opIndex].quantity += qty;
          existing.operationsBreakdown[opIndex].earned += earned;
        } else {
          existing.operationsBreakdown.push({
            operationName: opName,
            quantity: qty,
            earned,
          });
        }
      } else {
        workerMap.set(entry.workerId, {
          workerId: entry.workerId,
          workerCode: entry.workerCode || worker?.workerCode || "W-000",
          workerName: entry.workerName || worker?.name || "Worker",
          departmentName: entry.departmentName || worker?.departmentName || "-",
          totalPieces: qty,
          totalEarned: earned,
          operationsBreakdown: [
            {
              operationName: opName,
              quantity: qty,
              earned,
            },
          ],
        });
      }
    });

    return Array.from(workerMap.values());
  },

  getDepartmentWiseReport: (month?: string): DepartmentWiseReportRow[] => {
    const entries = useProductionStore.getState().entries;
    const departments = useMasterDataStore.getState().departments;
    const workers = useWorkerStore.getState().workers;

    const filtered = month ? entries.filter((e) => e.date.startsWith(month)) : entries;

    return departments.map((dept) => {
      const deptEntries = filtered.filter((e) => e.departmentId === dept.id);
      const deptWorkers = workers.filter((w) => w.departmentId === dept.id);

      const totalPieces = deptEntries.reduce((sum, e) => sum + e.quantity, 0);
      const totalPayout = deptEntries.reduce((sum, e) => sum + e.totalPayment, 0);
      const activeWorkersCount = deptWorkers.length;
      const averageEarnedPerWorker =
        activeWorkersCount > 0 ? totalPayout / activeWorkersCount : 0;

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        activeWorkersCount,
        totalPieces,
        totalPayout,
        averageEarnedPerWorker,
      };
    });
  },

  getMonthlyPayrollReport: (): MonthlyPayrollReportRow[] => {
    const records = usePayrollStore.getState().monthlyRecords;
    return records.map((r) => ({
      month: r.month,
      totalWorkers: r.totalWorkers,
      totalProduction: r.totalQuantity,
      totalPayout: r.totalNetPayable,
      status: r.status,
    }));
  },

  // Backend-based reports
  async getLabourWiseReportFromBackend(month: string): Promise<any> {
    try {
      const response = await axios.get("/api/admin/payroll/reports/labour-wise", {
        params: { month },
      });
      return response.data.items || [];
    } catch (error) {
      console.error("Failed to fetch labour-wise report from backend:", error);
      throw error;
    }
  },

  async getDepartmentWiseReportFromBackend(month: string): Promise<any> {
    try {
      const response = await axios.get("/api/admin/payroll/reports/department-wise", {
        params: { month },
      });
      return response.data.items || [];
    } catch (error) {
      console.error("Failed to fetch department-wise report from backend:", error);
      throw error;
    }
  },

  async downloadLabourWiseReportPDF(month: string): Promise<void> {
    try {
      const response = await axios.get("/api/admin/payroll/reports/labour-wise/pdf", {
        params: { month },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `labour_wise_report_${month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download labour-wise report PDF:", error);
      throw error;
    }
  },

  async downloadDepartmentWiseReportPDF(month: string): Promise<void> {
    try {
      const response = await axios.get("/api/admin/payroll/reports/department-wise/pdf", {
        params: { month },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `department_wise_report_${month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download department-wise report PDF:", error);
      throw error;
    }
  },

  async downloadPayrollPDF(payrollItemId: string, workerCode: string): Promise<void> {
    try {
      const response = await axios.get(`/api/admin/payroll/pdf/${payrollItemId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payroll_${workerCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download payroll PDF:", error);
      throw error;
    }
  },
};
