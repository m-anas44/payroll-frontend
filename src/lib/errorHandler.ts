import { isAxiosError } from "axios";

/**
 * Parses and throws a standardized Error object from an unknown API/catch error.
 */
export function handleApiError(error: unknown, fallbackMessage: string): never {
  if (isAxiosError(error)) {
    const detail =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.response?.data?.error;

    if (typeof detail === "string" && detail.trim()) {
      throw new Error(detail);
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object" && "msg" in item && typeof item.msg === "string") {
            return item.msg;
          }
          return null;
        })
        .filter(Boolean);

      if (messages.length > 0) {
        throw new Error(messages.join(", "));
      }
    }

    if (detail && typeof detail === "object" && "msg" in detail && typeof detail.msg === "string") {
      throw new Error(detail.msg);
    }

    if (error.message) {
      throw new Error(error.message);
    }
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error(fallbackMessage);
}

/**
 * Extracts a user-friendly error message string without throwing.
 */
export function extractErrorMessage(error: unknown, fallbackMessage: string): string {
  try {
    handleApiError(error, fallbackMessage);
  } catch (err: any) {
    return err.message || fallbackMessage;
  }
}
