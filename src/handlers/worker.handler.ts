import { browserClient as axios } from "@/lib/browserClient";
import { Worker, PoliceVerificationStatus, WorkerGender, WorkerStatus, WorkerBatchResponse, WorkerBatchItem, ImportWorkersResponse, WorkerExportPdfResponse } from "@/types/worker";
import { isValidCNIC } from "@/lib/validators";

const normalizePoliceVerification = (value?: string): PoliceVerificationStatus => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "yes" || normalized === "verified") return "Verified";
  if (normalized === "pending") return "Pending";
  return "Not Verified";
};

const normalizeGender = (value?: string): WorkerGender => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "male") return "Male";
  if (normalized === "female") return "Female";
  return "Other";
};

const normalizeStatus = (value?: string): WorkerStatus => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "inactive") return "inactive";
  if (normalized === "on_leave" || normalized === "on leave") return "on_leave";
  if (normalized === "terminated") return "terminated";
  return "active";
};

const normalizeWorker = (item: any): Worker => ({
  _id: item?._id || item?.id || "",
  name: item?.name || "Unnamed Worker",
  cnic: item?.cnic || "",
  fatherHusbandName: item?.fatherHusbandName || item?.father_husband_name || "",
  departmentId: item?.departmentId || item?.department_id || "",
  departmentName: item?.departmentName || item?.department_name || "",
  skill: item?.skill || "",
  doj: item?.dateOfJoining || item?.date_of_joining || "",
  dob: item?.dateOfBirth || item?.date_of_birth || "",
  gender: normalizeGender(item?.gender || item?.Gender),
  contact: item?.contactNumber || item?.contact_number || "",
  address: item?.address || "",
  policeVerification: normalizePoliceVerification(item?.policeVerification || item?.police_verification),
  status: normalizeStatus(item?.status),
  createdAt: item?.createdAt || new Date().toISOString(),
});

const toApiPayload = (data: any) => {
  const payload: Record<string, any> = {
    name: data.name,
    cnic: data.cnic,
    fatherHusbandName: data.fatherHusbandName || data.father_husband_name || null,
    departmentId: data.departmentId,
    dateOfJoining: data.doj || data.dateOfJoining,
    dateOfBirth: data.dob || data.dateOfBirth || null,
    gender: String(data.gender || "other").toLowerCase(),
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
      data.status || "active"
  };

  if (!payload.dateOfJoining) {
    delete payload.dateOfJoining;
  }

  return payload;
};

export async function getWorkers(params?: Record<string, string | number | undefined>) {
  try {
    const response = await axios.get("/api/admin/workers", { params });
    const payload = response.data?.data ?? response.data ?? {};
    const items = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : [];

    return {
      items: items.map(normalizeWorker),
      total: Number(payload.total ?? items.length ?? 0),
      page: Number(payload.page ?? 1),
      limit: Number(payload.limit ?? items.length ?? 20),
    };
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
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
    return response.data?.data ?? response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
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
    return response.data?.data ?? response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to update worker.";
    throw new Error(message);
  }
}

export async function deleteWorker(id: string) {
  try {
    const response = await axios.delete(`/api/admin/workers/${id}`);
    return response.data?.data ?? response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to delete worker.";
    throw new Error(message);
  }
}

export async function createWorkersBatch(
  workers: WorkerBatchItem[]
): Promise<WorkerBatchResponse> {
  try {
    const response = await axios.post("/api/admin/workers/batch", { workers });
    return response.data?.data || response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to import workers.";
    throw new Error(message);
  }
}

export async function uploadWorkersExcel(
  formData: FormData
): Promise<ImportWorkersResponse> {
  const response = await axios.post("/api/workers/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.data || response.data;
}

export async function exportWorkersPdf(params?: {
  status?: string;
  departmentId?: string;
  policeVerification?: string;
  search?: string;
}): Promise<WorkerExportPdfResponse> {
  try {
    const response = await axios.get("/api/admin/workers/export/pdf", { params });
    const payload = response.data?.data || response.data;

    if (payload?.fileBase64 && typeof window !== "undefined") {
      const byteCharacters = atob(payload.fileBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: payload.contentType || "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", payload.filename || "workers_directory.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    }

    return payload;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to export workers PDF.";
    throw new Error(message);
  }
}