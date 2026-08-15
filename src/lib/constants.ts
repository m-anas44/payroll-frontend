import { WorkerStatus } from "@/types/worker";

export const APP_NAME = "Piece Rate Payroll Management";
export const COMPANY_NAME = "Piece Rate Wagers Ltd.";

export const SKILLS_LIST = [
  "Stitching Specialist",
  "Cutting Master",
  "Machine Operator",
  "Finishing Helper",
  "Quality Inspector",
  "Upper Assembler",
  "Sole Fitter",
  "Packing Specialist",
];

export const POLICE_VERIFICATION_STATUSES = [
  "Verified",
  "Pending",
  "Not Verified",
];

export const USER_ROLES = ["Admin", "Worker"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const WORKER_STATUS_OPTIONS: { value: WorkerStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On Leave" },
  { value: "terminated", label: "Terminated" },
];

export const WORKER_STATUS_MAP: Record<WorkerStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On Leave",
  terminated: "Terminated",
};