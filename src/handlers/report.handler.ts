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
};
