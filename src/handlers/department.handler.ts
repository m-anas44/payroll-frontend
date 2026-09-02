import { browserClient as axios } from "@/lib/browserClient";
import { Department } from "@/types/department";

const normalizeDepartment = (item: any): Department => ({
  _id: item?._id || item?.id || "",
  code: item?.code?.trim() || "NO-CODE",
  name: item?.name || "Unnamed Department",
  description: item?.description || "Operational unit for piece rate manufacturing.",
  status: item?.status === "inactive" ? "Inactive" : "Active",
  createdAt: item?.createdAt || new Date().toISOString(),
  workerCount: item?.workerCount ?? 0,
});

export async function getDepartments(): Promise<Department[]> {
  try {
    const response = await axios.get("/api/admin/departments");
    const items = Array.isArray(response.data?.items)
      ? response.data.items
      : Array.isArray(response.data)
        ? response.data
        : [];

    return items.map(normalizeDepartment);
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to load departments.";
    throw new Error(message);
  }
}

export async function createDepartment(data: Omit<Department, "id" | "createdAt">) {
  if (!data.name?.trim()) {
    throw new Error("Department name is required.");
  }

  const payload = {
    ...data,
    code: data.code?.trim() || undefined,
    description: data.description?.trim() || undefined,
    status: data.status === "Inactive" ? "inactive" : "active",
  };

  try {
    const response = await axios.post("/api/admin/departments", payload);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to create department.";
    throw new Error(message);
  }
}

export async function updateDepartment(id: string, updates: Partial<Department>) {
  try {
    const payload = {
      ...updates,
      code: updates.code?.trim() || undefined,
      description: updates.description?.trim() || undefined,
      status: updates.status === "Inactive" ? "inactive" : "active",
    };

    const response = await axios.put(`/api/admin/departments/${id}`, payload);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to update department.";
    throw new Error(message);
  }
}

export async function deleteDepartment(id: string) {
  try {
    const response = await axios.delete(`/api/admin/departments/${id}`);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Unable to delete department.";
    throw new Error(message);
  }
}
