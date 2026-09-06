import { browserClient as axios } from "@/lib/browserClient";
import { handleApiError } from "@/lib/errorHandler";
import {
  Operator,
  CreateOperatorData,
  UpdateOperatorData,
} from "@/types/operator";

const normalizeOperator = (item: any): Operator => {
  const id = item?._id || item?.id || "";
  const departmentIds = Array.isArray(item?.departmentIds)
    ? item.departmentIds
    : Array.isArray(item?.department_ids)
    ? item.department_ids
    : [];
  const departmentNames = Array.isArray(item?.departmentNames)
    ? item.departmentNames
    : Array.isArray(item?.department_names)
    ? item.department_names
    : [];

  return {
    _id: id,
    id: id,
    name: item?.name || "Operator",
    email: item?.email || "",
    role: item?.role || "operator",
    status: item?.status === "inactive" ? "inactive" : "active",
    departmentIds,
    departmentNames,
    createdAt: item?.createdAt || item?.created_at || new Date().toISOString(),
    updatedAt: item?.updatedAt || item?.updated_at,
  };
};

export async function getOperators(): Promise<Operator[]> {
  try {
    const response = await axios.get("/api/admin/operators");
    const rawData = response.data?.data ?? response.data?.items ?? response.data;
    const items = Array.isArray(rawData?.items)
      ? rawData.items
      : Array.isArray(rawData)
      ? rawData
      : [];
    return items.map(normalizeOperator);
  } catch (error) {
    return handleApiError(error, "Unable to load operators.");
  }
}

export async function createOperator(data: CreateOperatorData): Promise<Operator> {
  if (!data.name?.trim()) {
    throw new Error("Name is required.");
  }
  if (!data.email?.trim()) {
    throw new Error("Email address is required.");
  }
  if (!data.password?.trim()) {
    throw new Error("Password is required.");
  }

  try {
    const response = await axios.post("/api/admin/operators", data);
    const item = response.data?.data || response.data;
    return normalizeOperator(item);
  } catch (error) {
    return handleApiError(error, "Unable to create operator.");
  }
}

export async function updateOperator(
  id: string,
  updates: UpdateOperatorData
): Promise<Operator> {
  try {
    const response = await axios.put(`/api/admin/operators/${id}`, updates);
    const item = response.data?.data || response.data;
    return normalizeOperator(item);
  } catch (error) {
    return handleApiError(error, "Unable to update operator.");
  }
}

export async function deleteOperator(id: string): Promise<void> {
  try {
    await axios.delete(`/api/admin/operators/${id}`);
  } catch (error) {
    return handleApiError(error, "Unable to delete operator.");
  }
}
