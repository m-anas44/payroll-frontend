import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import axiosRetry from "axios-retry";
import { toast } from "sonner";

// Next.js client-side env vars MUST be prefixed with NEXT_PUBLIC_
const FASTAPI_BASE_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL ||
  (process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_FASTAPI_PROD_URL
    : "http://localhost:8000");

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${FASTAPI_BASE_URL?.replace(/\/$/, "")}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Safely retry ONLY network drops or GET requests to prevent duplicate batch production submissions
axiosRetry(apiClient, {
  retries: 2,
  retryDelay: (retryCount) => retryCount * 1000,
  shouldResetTimeout: true,
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) ||
    (axiosRetry.isIdempotentRequestError(error) && error.code === "ECONNABORTED"),
});

// -- Deduplication State for Refresh & Toasts --------------------------------
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: AxiosResponse) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}> = [];

let isShowingError = false;
let errorTimeout: ReturnType<typeof setTimeout> | undefined;

// ==================== REQUEST INTERCEPTOR ====================
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined" && !window.navigator.onLine) {
    const controller = new AbortController();
    config.signal = controller.signal;
    controller.abort("User is offline");
  }
  return config;
});

// ==================== RESPONSE INTERCEPTOR ====================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & {
      _retried?: boolean;
    };

    const status = error?.response?.status;

    if (typeof window !== "undefined") {
      // 1. Silent Refresh + Queueing for 401 Errors
      if (
        status === 401 &&
        !originalConfig._retried &&
        !originalConfig.url?.includes("/api/auth/refresh")
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            pendingQueue.push({ resolve, reject, config: originalConfig });
          });
        }

        isRefreshing = true;
        originalConfig._retried = true;

        try {
          // Silent refresh call
          await apiClient.post("/api/auth/refresh");

          // Resolve all concurrent requests queued during the refresh
          const queued = pendingQueue.splice(0);
          for (const pending of queued) {
            try {
              pending.resolve(await apiClient(pending.config));
            } catch (retryErr) {
              pending.reject(retryErr);
            }
          }

          return apiClient(originalConfig);
        } catch (refreshError) {
          // Reject all queued requests and boot user to login page
          pendingQueue.splice(0).forEach(({ reject }) => reject(refreshError));

          sessionStorage.clear();
          if (!isShowingError) {
            isShowingError = true;
            toast.error("Your session has expired. Please log in again.");
            setTimeout(() => {
              isShowingError = false;
            }, 3000);
          }

          setTimeout(() => {
            if (window.location.pathname !== "/") {
              window.location.href = "/";
            }
          }, 1000);

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // 2. Debounced Toast Notifications for Non-401 Errors
      if (status !== 401) {
        let message = "Something went wrong. Try again.";

        if (
          error.code === "ECONNABORTED" ||
          error.message?.includes("timeout")
        ) {
          message = "Request timed out. Please check your connection.";
        } else if (error?.response?.data?.message) {
          message = error.response.data.message;
        } else if (error?.response?.data?.detail) {
          message = error.response.data.detail;
        }

        if (!isShowingError) {
          isShowingError = true;
          toast.error(message);
          clearTimeout(errorTimeout);
          errorTimeout = setTimeout(() => {
            isShowingError = false;
          }, 3000);
        }
      }
    }

    return Promise.reject(error);
  }
);