/**
 * browserClient - Axios instance for React component use (client-side only).
 *
 * On 401 responses it automatically:
 *   1. Calls POST /api/auth/refresh to silently renew the access token.
 *   2. Retries the original request once.
 *   3. If refresh fails, redirects the user to the login page.
 *
 * Concurrent 401s are deduplicated: only one refresh request is made;
 * all pending calls queue up and retry together after the refresh resolves.
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

// -- State for deduplication ----------------------------------------------------
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: AxiosResponse) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}> = [];

const browserClient: AxiosInstance = axios.create({
  timeout: 30000,
});

// -- Request interceptor -------------------------------------------------------
browserClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined" && !window.navigator.onLine) {
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort("User is offline");
    }
    return config;
  }
);

// -- Response interceptor ------------------------------------------------------
browserClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config as InternalAxiosRequestConfig & {
      _retried?: boolean;
    };

    const status = error?.response?.status;

    // Only attempt refresh for 401 errors on non-refresh requests
    if (
      status === 401 &&
      !originalConfig._retried &&
      !originalConfig.url?.includes("/api/auth/refresh")
    ) {
      if (isRefreshing) {
        // Queue this request to retry after the in-progress refresh finishes
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config: originalConfig });
        });
      }

      isRefreshing = true;
      originalConfig._retried = true;

      try {
        await axios.post("/api/auth/refresh");

        // Resolve all pending queued requests with fresh cookies
        const queued = pendingQueue.splice(0);
        for (const pending of queued) {
          try {
            pending.resolve(await browserClient(pending.config));
          } catch (retryErr) {
            pending.reject(retryErr);
          }
        }

        return browserClient(originalConfig);
      } catch (refreshError) {
        // Refresh failed - clear queue and redirect to login
        pendingQueue.splice(0).forEach(({ reject }) => reject(refreshError));

        if (typeof window !== "undefined") {
          sessionStorage.clear();
          toast.error("Your session has expired. Please log in again.");
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // -- Non-401 error handling ---------------------------------------------
    if (typeof window !== "undefined" && status !== 401) {
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

      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export { browserClient };