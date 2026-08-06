export type PoliceVerificationStatus = "Verified" | "Pending" | "Not Verified";

export interface Worker {
  id: string;
  workerCode: string;
  name: string;
  cnic: string;
  departmentId: string;
  departmentName?: string;
  skill: string;
  doj: string; // Date of Joining
  dob: string; // Date of Birth
  contact: string;
  address: string;
  policeVerification: PoliceVerificationStatus;
  status: "Active" | "Inactive";
  createdAt: string;
}
