import { usePayrollStore } from "@/store/payroll.store";

export const PayrollHandler = {
  generatePayroll: (month: string, generatedBy = "Admin", notes = "") => {
    if (!month) {
      return { success: false, message: "Month (YYYY-MM) is required.", record: null };
    }
    const record = usePayrollStore
      .getState()
      .generatePayrollForMonth(month, generatedBy, notes);
    return {
      success: true,
      message: `Payroll for ${month} generated with ${record.items.length} worker summaries.`,
      record,
    };
  },

  updateAdjustment: (
    month: string,
    workerId: string,
    bonuses: number,
    deductions: number
  ) => {
    usePayrollStore
      .getState()
      .updateWorkerAdjustment(month, workerId, bonuses, deductions);
    return { success: true, message: "Worker payment adjustment updated." };
  },

  updateStatus: (id: string, status: "Draft" | "Approved" | "Paid") => {
    usePayrollStore.getState().updatePayrollStatus(id, status);
    return { success: true, message: `Payroll status updated to ${status}.` };
  },
};
