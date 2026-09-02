import { browserClient as axios } from "@/lib/browserClient";

export async function login(payload: any) {
  try {
    const response = await axios.post("/api/auth/login", payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || "Login failed";
    throw new Error(message);
  }
}

export async function logout() {
  try {
    const response = await axios.post("/api/auth/logout");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || "Logout failed";
    throw new Error(message);
  }
}