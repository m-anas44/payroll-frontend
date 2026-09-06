import { browserClient as axios } from "@/lib/browserClient";
import { handleApiError } from "@/lib/errorHandler";

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
  }
}