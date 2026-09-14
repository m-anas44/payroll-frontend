import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

// Global singleton tracking any active in-flight refresh request across the application
let refreshPromise: Promise<boolean> | null = null;

/**
 * Executes a single-flight call to `/api/auth/refresh`.
 * Multiple parallel invocations coalesce into the same promise.
 */
export async function refreshAuthSession(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      // Use raw axios to prevent infinite recursive interceptor loops
      const response = await axios.post(
        "/api/auth/refresh",
        {},
        {
          withCredentials: true,
          headers: { "Cache-Control": "no-store" },
        },
      );
      return response.status === 200;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Interceptor that traps 401s, waits for token refresh via the singleton promise,
 * and seamlessly retries the original request once rotation completes.
 */
export function attachAuthInterceptors(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Pass through if error is canceled or not an authorization failure
      if (
        !error.response ||
        error.response.status !== 401 ||
        !originalRequest
      ) {
        return Promise.reject(error);
      }

      // Avoid looping on auth endpoints or requests already retried
      const isAuthEndpoint =
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/login");

      if (originalRequest._retry || isAuthEndpoint) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshSuccess = await refreshAuthSession();

      if (refreshSuccess) {
        return instance(originalRequest);
      }

      // If refresh failed and this runs in the browser, redirect to login
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login?expired=true";
      }

      return Promise.reject(error);
    },
  );

  return instance;
}

const baseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_FASTAPI_PROD_URL
    : process.env.NEXT_PUBLIC_FASTAPI_DEV_URL;

export const apiClient = attachAuthInterceptors(
  axios.create({
    baseURL: `${baseUrl}/api`,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 30000,
  }),
);
