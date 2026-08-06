import { create } from "zustand";
import { MonthlyPayrollRecord, WorkerPayrollSummary } from "@/types/payroll";
import { useProductionStore } from "./production.store";
import { useWorkerStore } from "./worker.store";

interface PayrollState {
  monthlyRecords: MonthlyPayrollRecord[];
  selectedMonth: string; // "YYYY-MM"
  setSelectedMonth: (month: string) => void;

  generatePayrollForMonth: (
    month: string,
    generatedBy?: string,
    notes?: string
  ) => MonthlyPayrollRecord;

  updateWorkerAdjustment: (
    month: string,
    workerId: string,
    bonuses: number,
    deductions: number
  ) => void;

  updatePayrollStatus: (
    id: string,
    status: "Draft" | "Approved" | "Paid"
  ) => void;
}

const initialSampleRecords: MonthlyPayrollRecord[] = [
  {
    id: "pay-2026-08",
    month: "2026-08",
    generatedAt: "2026-08-02T12:00:00Z",
    generatedBy: "Admin",
    status: "Approved",
    totalWorkers: 5,
    totalQuantity: 800,
    totalGrossEarnings: 32500.0,
    totalNetPayable: 32500.0,
    notes: "August 2026 Monthly Production Payroll",
    items: [
      {
        workerId: "wrk-101",
        workerCode: "W-1001",
        workerName: "Muhammad Usman",
        cnic: "35202-1234567-1",
        departmentName: "Cutting Department",
        totalQuantity: 280,
        grossEarnings: 10520.0,
        bonuses: 500,
        deductions: 0,
        netPayable: 11020.0,
        totalEntriesCount: 3,
      },
      {
        workerId: "wrk-102",
        workerCode: "W-1002",
        workerName: "Tariq Mahmood",
        cnic: "35201-9876543-3",
        departmentName: "Stitching Department",
        totalQuantity: 150,
        grossEarnings: 4275.0,
        bonuses: 0,
        deductions: 0,
        netPayable: 4275.0,
        totalEntriesCount: 2,
      },
      {
        workerId: "wrk-103",
        workerCode: "W-1003",
        workerName: "Ali Raza",
        cnic: "35202-4567890-5",
        departmentName: "Stitching Department",
        totalQuantity: 140,
        grossEarnings: 6800.0,
        bonuses: 200,
        deductions: 0,
        netPayable: 7000.0,
        totalEntriesCount: 2,
      },
      {
        workerId: "wrk-104",
        workerCode: "W-1004",
        workerName: "Rashid Khan",
        cnic: "35202-8877665-9",
        departmentName: "Sole & Bottom Department",
        totalQuantity: 110,
        grossEarnings: 6100.0,
        bonuses: 0,
        deductions: 0,
        netPayable: 6100.0,
        totalEntriesCount: 2,
      },
      {
        workerId: "wrk-105",
        workerCode: "W-1005",
        workerName: "Bilal Ahmad",
        cnic: "35201-3344556-7",
        departmentName: "Finishing & Packing",
        totalQuantity: 120,
        grossEarnings: 4800.0,
        bonuses: 0,
        deductions: 0,
        netPayable: 4800.0,
        totalEntriesCount: 2,
      },
    ],
  },
  {
    id: "pay-2026-07",
    month: "2026-07",
    generatedAt: "2026-07-31T17:30:00Z",
    generatedBy: "System Admin",
    status: "Paid",
    totalWorkers: 5,
    totalQuantity: 1450,
    totalGrossEarnings: 58200.0,
    totalNetPayable: 58700.0,
    notes: "July 2026 Monthly Finalized Salary Disbursement",
    items: [
      {
        workerId: "wrk-101",
        workerCode: "W-1001",
        workerName: "Muhammad Usman",
        cnic: "35202-1234567-1",
        departmentName: "Cutting Department",
        totalQuantity: 420,
        grossEarnings: 18900.0,
        bonuses: 1000,
        deductions: 0,
        netPayable: 19900.0,
        totalEntriesCount: 8,
      },
      {
        workerId: "wrk-102",
        workerCode: "W-1002",
        workerName: "Tariq Mahmood",
        cnic: "35201-9876543-3",
        departmentName: "Stitching Department",
        totalQuantity: 310,
        grossEarnings: 11800.0,
        bonuses: 0,
        deductions: 200,
        netPayable: 11600.0,
        totalEntriesCount: 6,
      },
      {
        workerId: "wrk-103",
        workerCode: "W-1003",
        workerName: "Ali Raza",
        cnic: "35202-4567890-5",
        departmentName: "Stitching Department",
        totalQuantity: 280,
        grossEarnings: 12600.0,
        bonuses: 500,
        deductions: 0,
        netPayable: 13100.0,
        totalEntriesCount: 5,
      },
      {
        workerId: "wrk-104",
        workerCode: "W-1004",
        workerName: "Rashid Khan",
        cnic: "35202-8877665-9",
        departmentName: "Sole & Bottom Department",
        totalQuantity: 240,
        grossEarnings: 8900.0,
        bonuses: 0,
        deductions: 0,
        netPayable: 8900.0,
        totalEntriesCount: 4,
      },
      {
        workerId: "wrk-105",
        workerCode: "W-1005",
        workerName: "Bilal Ahmad",
        cnic: "35201-3344556-7",
        departmentName: "Finishing & Packing",
        totalQuantity: 200,
        grossEarnings: 6000.0,
        bonuses: 0,
        deductions: 0,
        netPayable: 6000.0,
        totalEntriesCount: 4,
      },
    ],
  },
  {
    id: "pay-2026-06",
    month: "2026-06",
    generatedAt: "2026-06-30T16:00:00Z",
    generatedBy: "System Admin",
    status: "Paid",
    totalWorkers: 5,
    totalQuantity: 1200,
    totalGrossEarnings: 49500.0,
    totalNetPayable: 49500.0,
    notes: "June 2026 Finalized Salary Disbursement",
    items: [
      {
        workerId: "wrk-101",
        workerCode: "W-1001",
        workerName: "Muhammad Usman",
        cnic: "35202-1234567-1",
        departmentName: "Cutting Department",
        totalQuantity: 380,
        grossEarnings: 16500.0,
        bonuses: 0,
        deductions: 0,
        netPayable: 16500.0,
        totalEntriesCount: 7,
      },
      {
        workerId: "wrk-102",
        workerCode: "W-1002",
        workerName: "Tariq Mahmood",
        cnic: "35201-9876543-3",
        departmentName: "Stitching Department",
        totalQuantity: 260,
        grossEarnings: 10200.0,
        bonuses: 0,
        deductions: 0,
        netPayable: 10200.0,
        totalEntriesCount: 5,
      },
      {
        workerId: "wrk-103",
        workerCode: "W-1003",
        workerName: "Ali Raza",
        cnic: "35202-4567890-5",
        departmentName: "Stitching Department",
        totalQuantity: 220,
        grossEarnings: 9800.0,
        bonuses: 0,
        deductions: 0,
        netPayable: 9800.0,
        totalEntriesCount: 4,
      },
      {
        workerId: "wrk-104",
        workerCode: "W-1004",
        workerName: "Rashid Khan",
        cnic: "35202-8877665-9",
        departmentName: "Sole & Bottom Department",
        totalQuantity: 190,
        grossEarnings: 7500.0,
        bonuses: 0,
        deductions: 0,
        netPayable: 7500.0,
        totalEntriesCount: 4,
      },
      {
        workerId: "wrk-105",
        workerCode: "W-1005",
        workerName: "Bilal Ahmad",
        cnic: "35201-3344556-7",
        departmentName: "Finishing & Packing",
        totalQuantity: 150,
        grossEarnings: 5500.0,
        bonuses: 0,
        deductions: 0,
        netPayable: 5500.0,
        totalEntriesCount: 3,
      },
    ],
  },
];

export const usePayrollStore = create<PayrollState>((set) => ({
  monthlyRecords: initialSampleRecords,
  selectedMonth: "2026-08",

  setSelectedMonth: (month) => set({ selectedMonth: month }),

  generatePayrollForMonth: (month, generatedBy = "Admin", notes = "") => {
    const productionEntries = useProductionStore.getState().entries;
    const workers = useWorkerStore.getState().workers;

    // Filter production entries strictly for the selected month (YYYY-MM)
    const monthEntries = productionEntries.filter((e) =>
      e.date.startsWith(month)
    );

    // Group production entries by workerId
    const workerMap = new Map<string, WorkerPayrollSummary>();

    monthEntries.forEach((entry) => {
      const worker = workers.find((w) => w.id === entry.workerId);
      const existing = workerMap.get(entry.workerId);

      const gross = entry.totalPayment;
      const qty = entry.quantity;

      if (existing) {
        existing.totalQuantity += qty;
        existing.grossEarnings += gross;
        existing.netPayable += gross;
        existing.totalEntriesCount += 1;
      } else {
        workerMap.set(entry.workerId, {
          workerId: entry.workerId,
          workerCode: entry.workerCode || worker?.workerCode || "W-000",
          workerName: entry.workerName || worker?.name || "Worker",
          cnic: worker?.cnic || "-",
          departmentName: entry.departmentName || worker?.departmentName || "-",
          totalQuantity: qty,
          grossEarnings: gross,
          bonuses: 0,
          deductions: 0,
          netPayable: gross,
          totalEntriesCount: 1,
        });
      }
    });

    const items = Array.from(workerMap.values());
    const totalWorkers = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.totalQuantity, 0);
    const totalGrossEarnings = items.reduce((sum, item) => sum + item.grossEarnings, 0);
    const totalNetPayable = items.reduce((sum, item) => sum + item.netPayable, 0);

    const record: MonthlyPayrollRecord = {
      id: `pay-${month}`,
      month,
      generatedAt: new Date().toISOString(),
      generatedBy,
      status: "Draft",
      totalWorkers,
      totalQuantity,
      totalGrossEarnings,
      totalNetPayable,
      notes: notes || `Payroll generated for ${month}`,
      items,
    };

    set((state) => ({
      monthlyRecords: [
        record,
        ...state.monthlyRecords.filter((r) => r.month !== month),
      ],
      selectedMonth: month,
    }));

    return record;
  },

  updateWorkerAdjustment: (month, workerId, bonuses, deductions) =>
    set((state) => {
      return {
        monthlyRecords: state.monthlyRecords.map((record) => {
          if (record.month !== month) return record;

          const updatedItems = record.items.map((item) => {
            if (item.workerId !== workerId) return item;

            const netPayable = item.grossEarnings + bonuses - deductions;
            return {
              ...item,
              bonuses,
              deductions,
              netPayable,
            };
          });

          const totalNetPayable = updatedItems.reduce(
            (sum, i) => sum + i.netPayable,
            0
          );

          return {
            ...record,
            items: updatedItems,
            totalNetPayable,
          };
        }),
      };
    }),

  updatePayrollStatus: (id, status) =>
    set((state) => ({
      monthlyRecords: state.monthlyRecords.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    })),
}));
