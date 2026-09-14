import { browserClient as axios } from "@/lib/browserClient";
import { handleApiError } from "@/lib/errorHandler";
import { useAuthStore } from "@/store/auth.store";

export async function login(payload: any) {
  try {
    const response = await axios.post("/api/auth/login", payload);
    return response.data;
  } catch (error) {
    return handleApiError(error, "Login failed");
  }
}

export async function logout() {
  try {
    const response = await axios.post("/api/auth/logout");
    return response.data;
  } catch (error) {
    return handleApiError(error, "Logout failed");
  } finally {
    // Clear Zustand auth store state and persisted local storage
    useAuthStore.getState().logout();

    // Reset client navigation to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}