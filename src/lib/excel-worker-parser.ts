import * as XLSX from "xlsx";

export interface RawRowData {
  [key: string]: any;
}

export function parseExcelFile(fileBuffer: ArrayBuffer): { headers: string[]; rows: RawRowData[] } {
  const workbook = XLSX.read(fileBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: RawRowData[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  const headers: string[] = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows };
}

export function cleanCnic(val: any): string {
  if (!val) return "";
  // Resolve scientific notation conversion artifacts
  if (typeof val === "number") {
    return BigInt(Math.trunc(val)).toString();
  }
  return String(val).replace(/\D/g, "");
}

export function parseExcelDate(val: any): string | null {
  if (!val) return null;
  // Handle Excel serial date numbers (days since 1899-12-30)
  if (typeof val === "number" || (!isNaN(Number(val)) && !String(val).includes("-") && !String(val).includes("/"))) {
    const serial = Number(val);
    const utcDays = Math.floor(serial - 25569);
    const date = new Date(utcDays * 86400 * 1000);
    return !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : null;
  }
  // Handle formatted date strings
  const parsed = new Date(val);
  return !isNaN(parsed.getTime()) ? parsed.toISOString().split("T")[0] : null;
}

export function normalizeGender(val: any): "male" | "female" | "other" | null {
  if (!val) return null;
  const s = String(val).trim().toLowerCase();
  if (["m", "male", "boy", "man"].includes(s)) return "male";
  if (["f", "female", "girl", "woman"].includes(s)) return "female";
  if (["other", "transgender"].includes(s)) return "other";
  return null;
}

export function normalizePoliceVerification(val: any): "yes" | "no" {
  if (!val) return "no";
  const s = String(val).trim().toLowerCase();
  return ["yes", "true", "verified", "1", "y"].includes(s) ? "yes" : "no";
}

export function normalizeWorkerStatus(val: any): "active" | "inactive" {
  if (!val) return "active";
  const s = String(val).trim().toLowerCase();
  return ["inactive", "0", "disabled", "terminated"].includes(s) ? "inactive" : "active";
}
