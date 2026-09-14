import { browserClient as axios } from "@/lib/browserClient";
import { handleApiError } from "@/lib/errorHandler";
import { ChangePasswordPayload, SystemSettings } from "@/types/settings";

export async function changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
  if (!payload.currentPassword?.trim()) {
    throw new Error("Current password is required.");
  }
  if (!payload.newPassword || payload.newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters.");
  }
  if (payload.currentPassword === payload.newPassword) {
    throw new Error("New password must be different from current password.");
  }

  try {
    const response = await axios.post("/api/settings/change-password", payload);
    return response.data?.data || response.data;
  } catch (error) {
    return handleApiError(error, "Failed to change password.");
  }
}

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const response = await axios.get("/api/settings");
    const data = response.data?.data || response.data;
    return {
      companyName: data?.companyName || "Askari Footwear Manufacturing",
      currencySymbol: data?.currencySymbol || "Rs.",
      currencyCode: data?.currencyCode || "PKR",
    };
  } catch (error) {
    return handleApiError(error, "Failed to load system settings.");
  }
}

export async function updateSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
  if (!settings.companyName?.trim()) {
    throw new Error("Company name is required.");
  }
  if (!settings.currencySymbol?.trim()) {
    throw new Error("Currency symbol is required.");
  }

  try {
    const response = await axios.put("/api/settings", settings);
    const data = response.data?.data || response.data;
    return {
      companyName: data?.companyName || settings.companyName,
      currencySymbol: data?.currencySymbol || settings.currencySymbol,
      currencyCode: data?.currencyCode || settings.currencyCode,
    };
  } catch (error) {
    return handleApiError(error, "Failed to update system settings.");
  }
}
