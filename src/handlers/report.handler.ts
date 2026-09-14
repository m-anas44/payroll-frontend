import { browserClient as axios } from "@/lib/browserClient";
import { handleApiError } from "@/lib/errorHandler";

export const ReportHandler = {
  // Backend-based reports
  async getLabourWiseReportFromBackend(month: string): Promise<any> {
    try {
      const response = await axios.get("/api/admin/payroll/reports/labour-wise", {
        params: { month },
      });
      const resData = response.data?.data ?? response.data;
      return resData?.items || resData || [];
    } catch (error) {
      return handleApiError(error, "Failed to fetch labour-wise report from backend.");
    }
  },

  async getDepartmentWiseReportFromBackend(month: string): Promise<any> {
    try {
      const response = await axios.get("/api/admin/payroll/reports/department-wise", {
        params: { month },
      });
      const resData = response.data?.data ?? response.data;
      return resData?.items || resData || [];
    } catch (error) {
      return handleApiError(error, "Failed to fetch department-wise report from backend.");
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
      return handleApiError(error, "Failed to download labour-wise report PDF.");
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
      return handleApiError(error, "Failed to download department-wise report PDF.");
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
      return handleApiError(error, "Failed to download payroll PDF.");
    }
  },
};
