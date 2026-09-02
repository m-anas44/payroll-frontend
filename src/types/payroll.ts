export interface WorkerPayrollSummary {
  id: string; // payrollItemId
  workerId: string;
  workerCode: string;
  workerName: string;
  cnic: string;
  departmentName: string;
  // Attendance
  workingDays: number;
  sundayDays: number;
  totalDays: number;
  // Earnings
  totalQuantity: number;
  productionAmount: number;
  otherEarnings: number;
  allowanceAmount: number;
  minimumWageAdjustment: number;
  grossEarnings: number; // = grossAmount
  grossAmount: number;
  // Deductions
  advanceAmount: number;
  eobiAmount: number;
  otherDeductions: number;
  deductions: number; // = deductionAmount
  deductionAmount: number;
  // Net
  netPayable: number;
  netAmount: number;
  // Status
  status: string;
  totalEntriesCount: number;
}

export interface MonthlyPayrollRecord {
  id: string;
  month: string; // "YYYY-MM" e.g. "2026-08"
  generatedAt?: string;
  generatedBy?: string;
  status: "Draft" | "Approved" | "Paid" | "draft" | "generated" | "finalized";
  totalWorkers: number;
  totalQuantity: number;
  totalGrossEarnings: number;
  totalNetPayable: number;
  items: WorkerPayrollSummary[];
  notes?: string;
}
