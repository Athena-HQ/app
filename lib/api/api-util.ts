export const getApiBaseUrl = (): string => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  return "https://admin.athena-hq.it.com";
};

const API_BASE_URL = getApiBaseUrl();

interface RequestConfig extends RequestInit {
  timeout?: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithTimeout(
  url: string,
  config: RequestConfig = {},
): Promise<Response> {
  const { timeout = 10000, ...init } = config;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function normalizeErrorMessage(raw: unknown): string {
  const fallback = "An error occurred";
  if (raw === null || raw === undefined) {
    return fallback;
  }
  if (typeof raw === "string") {
    const match = raw.match(/string='([^']*)'/);
    if (match?.[1]) return match[1];
    return raw;
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (
      Array.isArray(obj.non_field_errors) &&
      obj.non_field_errors.length > 0
    ) {
      const first = obj.non_field_errors[0];
      return typeof first === "string" ? first : fallback;
    }
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (
        Array.isArray(val) &&
        val.length > 0 &&
        typeof val[0] === "string"
      ) {
        return val[0];
      }
    }
    return fallback;
  }
  return fallback;
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<T> {
  const baseUrl = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  try {
    const response = await fetchWithTimeout(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      }

      let errorMessage = "An error occurred";
      try {
        const errorData = await response.json();
        const raw =
          errorData.detail ?? errorData.message ?? errorData.details;
        errorMessage = normalizeErrorMessage(raw);
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(errorMessage, response.status, response.statusText);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return (await response.text()) as unknown as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new ApiError("Request timeout", 408, "Request Timeout");
      }
      throw new ApiError(error.message, 0, "Network Error");
    }

    throw new ApiError("Unknown error occurred", 0, "Unknown Error");
  }
}

export const api = {
  get: <T = unknown>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: "GET" }),

  post: <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ) =>
    apiRequest<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, config?: RequestConfig) =>
    apiRequest<T>(endpoint, { ...config, method: "DELETE" }),
};

export { ApiError };
