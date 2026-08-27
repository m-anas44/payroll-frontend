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