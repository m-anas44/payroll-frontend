import axios from "axios";
import axiosRetry from "axios-retry";
import toast from "react-hot-toast";

const FASTAPI_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FASTAPI_PROD_URL
    : process.env.FASTAPI_DEV_URL;

export const apiClient = axios.create({
  baseURL: FASTAPI_BASE_URL + "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // Explicit timeout limit (30 seconds)
});

axiosRetry(apiClient, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  shouldResetTimeout: true,
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) ||
    error.code === "ECONNABORTED",
});

let isShowingError = false;
let errorTimeout: ReturnType<typeof setTimeout> | undefined;

// ==================== REQUEST INTERCEPTOR ====================
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && !window.navigator.onLine) {
    const controller = new AbortController();
    config.signal = controller.signal;
    controller.abort("User is offline");
    return config;
  }

  return config;
});

// ==================== RESPONSE INTERCEPTOR ====================
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    /*
     * Do not call toast, sessionStorage,
     * location or Cookies when apiClient is
     * running inside a Next.js API route.
     */
    if (typeof window !== "undefined") {
      const status = error?.response?.status;

      if (status === 401) {
        sessionStorage.clear();
        if (!isShowingError) {
          isShowingError = true;
          toast.error("Session expired. Please log in again.");
          setTimeout(() => (isShowingError = false), 2000);
        }
        location.reload();
      } else {
        let message = "Something went wrong. Try again.";

        if (
          error.code === "ECONNABORTED" ||
          error.message?.includes("timeout")
        ) {
          message = "Request timed out. Please check your connection.";
        } else if (error?.response?.data?.message) {
          message = error.response.data.message;
        }

        if (!isShowingError) {
          isShowingError = true;
          toast.error(message);
          clearTimeout(errorTimeout);
          errorTimeout = setTimeout(() => {
            isShowingError = false;
          }, 2000);
        }
      }
    }

    return Promise.reject(error);
  },
);