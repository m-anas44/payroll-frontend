import axios from "axios";

export const getPayrolls = async (params?: Record<string, any>) => {
  const response = await axios.get("/api/admin/payroll", { params });
  return response.data;
};

export const getPayrollByMonth = async (month: string) => {
  const response = await axios.get(`/api/admin/payroll/${month}`);
  return response.data;
};

export const updatePayrollAdjustment = async (payload: {
  payrollId: string;
  workerId: string;
  allowanceAmount?: number;
  advanceAmount?: number;
  eobiAmount?: number;
  otherDeductions?: number;
}) => {
  const response = await axios.put("/api/admin/payroll/adjustments", payload);
  return response.data;
};

export const updatePayrollStatus = async (payload: {
  payrollId: string;
  status: string;
}) => {
  const response = await axios.patch("/api/admin/payroll/status", payload);
  return response.data;
};

export const PayrollHandler = {
  getPayrolls,
  getPayrollByMonth,
  updatePayrollAdjustment,
  updatePayrollStatus,
};

