export interface LabourWiseReportRow {
  workerId: string;
  workerCode: string;
  workerName: string;
  departmentName: string;
  totalPieces: number;
  totalEarned: number;
  operationsBreakdown: {
    operationName: string;
    quantity: number;
    earned: number;
  }[];
}

export interface DepartmentWiseReportRow {
  departmentId: string;
  departmentName: string;
  activeWorkersCount: number;
  totalPieces: number;
  totalPayout: number;
  averageEarnedPerWorker: number;
}

export interface MonthlyPayrollReportRow {
  month: string;
  totalWorkers: number;
  totalProduction: number;
  totalPayout: number;
  status: string;
}
