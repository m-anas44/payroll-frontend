import { RawRowData } from "@/lib/excel-worker-parser";
import { Department } from "@/types/department";

export type PoliceVerificationStatus = "Verified" | "Pending" | "Not Verified";
export type WorkerGender = "Male" | "Female" | "Other";
export type WorkerStatus = "active" | "inactive" | "on_leave" | "terminated";

export interface Worker {
  _id: string;
  name: string;
  cnic: string;
  fatherHusbandName: string;
  departmentId: string;
  departmentName?: string;
  skill: string;
  doj: string;
  dob: string;
  gender: WorkerGender;
  contact: string;
  address: string;
  policeVerification: PoliceVerificationStatus;
  status: WorkerStatus;
  createdAt: string;
}

export interface WorkerQueryParams {
  status?: string;
  departmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface WorkerListResponse {
  items: Worker[];
  total: number;
  page: number;
  limit: number;
}

export interface ImportWorkersResponse {
  message: string;
  importedCount: number;
}

export interface WorkerBatchItem {
  name: string;
  cnic: string;
  dateOfJoining: string;
  departmentId: string;
  dateOfBirth?: string | null;
  fatherHusbandName?: string | null;
  skill?: string | null;
  contactNumber?: string | null;
  gender?: "male" | "female" | "other" | null;
  address?: string | null;
  policeVerification?: "yes" | "no";
  status?: "active" | "inactive";
}

export interface WorkerBatchResponse {
  totalSubmitted: number;
  totalCreated: number;
  totalSkipped: number;
  skippedRecords: Array<{ cnic: string; name: string; reason: string }>;
}

export type WizardStep = 1 | 2 | 3 | 4;

export interface TargetFieldDef {
  key: string;
  label: string;
  required: boolean;
  hint: string;
}

export const TARGET_FIELDS: TargetFieldDef[] = [
  { key: "name", label: "Full Name", required: true, hint: "Worker's complete name (2-150 chars)" },
  { key: "cnic", label: "CNIC", required: true, hint: "13-digit national ID without dashes" },
  { key: "dateOfJoining", label: "Date of Joining", required: true, hint: "Date joined company (YYYY-MM-DD)" },
  { key: "department", label: "Department", required: true, hint: "Department name or code" },
  { key: "dateOfBirth", label: "Date of Birth", required: false, hint: "Birth date (optional)" },
  { key: "fatherHusbandName", label: "Father / Husband Name", required: false, hint: "Guardian name (optional)" },
  { key: "skill", label: "Skill / Designation", required: false, hint: "Role, craft, or skill level" },
  { key: "contactNumber", label: "Contact Number", required: false, hint: "Phone / mobile number" },
  { key: "gender", label: "Gender", required: false, hint: "Male, Female, or Other" },
  { key: "address", label: "Address", required: false, hint: "Residential address" },
  { key: "policeVerification", label: "Police Verification", required: false, hint: "Yes / No verification status" },
  { key: "status", label: "Status", required: false, hint: "Active or Inactive status" },
];

export interface CandidateRow {
  index: number;
  raw: RawRowData;
  data: WorkerBatchItem;
  errors: string[];
  isValid: boolean;
  included: boolean;
  isDuplicateInSheet: boolean;
}

export interface WorkerImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  departments: Department[];
}

export interface WorkerExportPdfResponse {
  filename: string;
  contentType: string;
  fileBase64: string;
}