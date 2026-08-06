export interface WorkerPayrollSummary {
  workerId: string;
  workerCode: string;
  workerName: string;
  cnic: string;
  departmentName: string;
  totalQuantity: number;
  grossEarnings: number;
  bonuses: number;
  deductions: number;
  netPayable: number;
  totalEntriesCount: number;
}

export interface MonthlyPayrollRecord {
  id: string;
  month: string; // "YYYY-MM" e.g. "2026-08"
  generatedAt: string;
  generatedBy: string;
  status: "Draft" | "Approved" | "Paid";
  totalWorkers: number;
  totalQuantity: number;
  totalGrossEarnings: number;
  totalNetPayable: number;
  items: WorkerPayrollSummary[];
  notes?: string;
}
