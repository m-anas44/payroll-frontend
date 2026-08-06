import { exportToCSV, parseCSVText } from "@/lib/excel";
import { useWorkerStore } from "@/store/worker.store";
import { useProductionStore } from "@/store/production.store";
import { usePayrollStore } from "@/store/payroll.store";
import { PoliceVerificationStatus } from "@/types/worker";

export const ExcelHandler = {
  exportWorkers: () => {
    const workers = useWorkerStore.getState().workers;
    const rows = workers.map((w) => ({
      "Worker Code": w.workerCode,
      Name: w.name,
      CNIC: w.cnic,
      Department: w.departmentName || "",
      Skill: w.skill,
      "Date of Joining": w.doj,
      "Date of Birth": w.dob,
      Contact: w.contact,
      Address: w.address,
      "Police Verification": w.policeVerification,
      Status: w.status,
    }));
    exportToCSV(`Workers_List_${new Date().toISOString().split("T")[0]}`, rows);
  },

  exportProduction: () => {
    const entries = useProductionStore.getState().entries;
    const rows = entries.map((e) => ({
      Date: e.date,
      "Worker Code": e.workerCode,
      "Worker Name": e.workerName,
      Department: e.departmentName,
      Article: e.articleName,
      Operation: e.operationName,
      Quantity: e.quantity,
      "Rate Applied": e.rateApplied,
      "Total Payment": e.totalPayment,
      Remarks: e.remarks || "",
    }));
    exportToCSV(`Production_Records_${new Date().toISOString().split("T")[0]}`, rows);
  },

  exportPayroll: (month: string) => {
    const records = usePayrollStore.getState().monthlyRecords;
    const record = records.find((r) => r.month === month) || records[0];
    if (!record) return;

    const rows = record.items.map((item) => ({
      Month: record.month,
      "Worker Code": item.workerCode,
      "Worker Name": item.workerName,
      CNIC: item.cnic,
      Department: item.departmentName,
      "Total Quantity": item.totalQuantity,
      "Gross Earnings": item.grossEarnings,
      Bonuses: item.bonuses,
      Deductions: item.deductions,
      "Net Payable": item.netPayable,
    }));
    exportToCSV(`Payroll_Summary_${record.month}`, rows);
  },

  importWorkersFromCSV: (csvContent: string) => {
    const parsed = parseCSVText(csvContent);
    const workerStore = useWorkerStore.getState();

    const workersToImport = parsed.map((row) => ({
      workerCode: row["Worker Code"] || row["code"] || "",
      name: row["Name"] || row["name"] || "Imported Worker",
      cnic: row["CNIC"] || row["cnic"] || "35200-0000000-0",
      departmentId: "dept-1",
      departmentName: row["Department"] || "Cutting Department",
      skill: row["Skill"] || "General Worker",
      doj: row["Date of Joining"] || "2026-01-01",
      dob: row["Date of Birth"] || "1995-01-01",
      contact: row["Contact"] || "0300-0000000",
      address: row["Address"] || "Factory Area, Lahore",
      policeVerification: (row["Police Verification"] === "Verified" ||
      row["Police Verification"] === "Not Verified"
        ? row["Police Verification"]
        : "Pending") as PoliceVerificationStatus,
      status: "Active" as const,
    }));

    return workerStore.importWorkers(workersToImport);
  },
};
