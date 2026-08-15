import axios from "axios";
import { Worker, PoliceVerificationStatus } from "@/types/worker";
import { isValidCNIC } from "@/lib/validators";

const normalizePoliceVerification = (
  value?: string,
): PoliceVerificationStatus => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "yes" || normalized === "verified") return "Verified";
  if (normalized === "pending") return "Pending";
  return "Not Verified";
};

const normalizeStatus = (value?: string): "Active" | "Inactive" =>
  String(value || "").toLowerCase() === "inactive" ? "Inactive" : "Active";

const normalizeWorker = (item: any): Worker => ({
  id: item?._id || item?.id || "",
  workerCode: item?.workerCode || item?.worker_code || `W-${String(item?._id || item?.id || "").slice(-4) || "0001"}`,
  name: item?.name || "Unnamed Worker",
  cnic: item?.cnic || "",
  departmentId: item?.departmentId || item?.department_id || "",
  departmentName: item?.departmentName || item?.department_name || "General",
  skill: item?.skill || "General",
  doj: item?.dateOfJoining || item?.doj || new Date().toISOString().split("T")[0],
  dob: item?.dateOfBirth || item?.dob || "",
  contact: item?.contactNumber || item?.contact || "",
  address: item?.address || "",
  policeVerification: normalizePoliceVerification(item?.policeVerification),
  status: normalizeStatus(item?.status),
  createdAt: item?.createdAt || new Date().toISOString(),
});

const toApiPayload = (data: any) => {
  const payload: Record<string, any> = {
    name: data.name,
    cnic: data.cnic,
    departmentId: data.departmentId,
    dateOfJoining: data.doj || data.dateOfJoining,
    dateOfBirth: data.dob || data.dateOfBirth || null,
    skill: data.skill || null,
    contactNumber: data.contact || data.contactNumber || null,
    address: data.address || null,
    policeVerification:
      data.policeVerification === "Verified"
        ? "yes"
        : data.policeVerification === "Pending"
          ? "pending"
          : data.policeVerification === "Not Verified"
            ? "no"
            : data.policeVerification || "no",
    status:
      data.status === "Inactive" ? "inactive" : data.status === "Active" ? "active" : "active",
  };

  if (!payload.dateOfJoining) {
    delete payload.dateOfJoining;
  }

  return payload;
};

export async function getWorkers(params?: Record<string, string | number | undefined>) {
  try {
    const response = await axios.get("/api/admin/workers", { params });
    const items = Array.isArray(response.data?.items)
      ? response.data.items
      : Array.isArray(response.data)
        ? response.data
        : [];

    return items.map(normalizeWorker);
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to load workers.";
    throw new Error(message);
  }
}

export async function addWorker(data: any) {
  if (!data.name?.trim() || !data.cnic || !data.departmentId) {
    throw new Error("Name, CNIC, and Department are required.");
  }

  if (!isValidCNIC(data.cnic)) {
    throw new Error("Invalid CNIC format. Expected format: 12345-1234567-1.");
  }

  try {
    const payload = toApiPayload(data);
    const response = await axios.post("/api/admin/workers", payload);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to create worker.";
    throw new Error(message);
  }
}

export async function updateWorker(id: string, updates: any) {
  if (updates.cnic && !isValidCNIC(updates.cnic)) {
    throw new Error("Invalid CNIC format.");
  }

  try {
    const payload = toApiPayload(updates);
    const response = await axios.put(`/api/admin/workers/${id}`, payload);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to update worker.";
    throw new Error(message);
  }
}

export async function deleteWorker(id: string) {
  try {
    const response = await axios.delete(`/api/admin/workers/${id}`);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to delete worker.";
    throw new Error(message);
  }
}
