import { browserClient as axios } from "@/lib/browserClient";
import { handleApiError } from "@/lib/errorHandler";
import {
  PayrollAdjustmentPayload,
  PayrollItemUpdatePayload,
  PayrollStatusUpdatePayload,
} from "@/types/payroll";

export const getPayrolls = async (params?: Record<string, any>) => {
  try {
    const response = await axios.get("/api/admin/payroll", { params });
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to fetch monthly payroll records.");
  }
};

export const getPayrollByMonth = async (month: string) => {
  try {
    const response = await axios.get(`/api/admin/payroll/${month}`);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, `Failed to fetch payroll summary for ${month}.`);
  }
};

export const updatePayrollAdjustment = async (payload: PayrollAdjustmentPayload) => {
  try {
    const response = await axios.put("/api/admin/payroll/adjustments", payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to update payroll adjustment.");
  }
};

export const updatePayrollItem = async (payload: PayrollItemUpdatePayload) => {
  try {
    const response = await axios.put("/api/admin/payroll/adjustments", payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to update payroll item.");
  }
};

export const updatePayrollStatus = async (payload: PayrollStatusUpdatePayload) => {
  try {
    const response = await axios.patch("/api/admin/payroll/status", payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    return handleApiError(error, "Failed to update payroll status.");
  }
};

export const PayrollHandler = {
  getPayrolls,
  getPayrollByMonth,
  updatePayrollAdjustment,
  updatePayrollItem,
  updatePayrollStatus,
};
