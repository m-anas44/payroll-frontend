import { Department } from "@/types/department";
import { useMasterDataStore } from "@/store/masterData.store";

export const DepartmentHandler = {
  getDepartments: () => useMasterDataStore.getState().departments,

  addDepartment: (data: Omit<Department, "id" | "createdAt">) => {
    if (!data.name || !data.code) {
      return { success: false, message: "Department Code and Name are required." };
    }
    useMasterDataStore.getState().addDepartment(data);
    return { success: true, message: "Department added." };
  },

  updateDepartment: (id: string, updates: Partial<Department>) => {
    useMasterDataStore.getState().updateDepartment(id, updates);
    return { success: true, message: "Department updated." };
  },

  deleteDepartment: (id: string) => {
    useMasterDataStore.getState().deleteDepartment(id);
    return { success: true, message: "Department deleted." };
  },
};
