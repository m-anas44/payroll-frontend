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
