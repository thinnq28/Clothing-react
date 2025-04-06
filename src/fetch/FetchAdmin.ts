import ForbiddenPage from "../components/Forbidden";
import {environment} from "../environment/environment";

type FetchOptions = RequestInit & {
  timeout?: number; // Thêm timeout tùy chọn
};

const buildQueryString = (params: Record<string, any>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, String(value));
    }
  });
  return query.toString() ? `?${query.toString()}` : "";
};

const useFetchWithAuth = () => {
  const fetchWithAuth = async <T = any>(
    url: string,
    options: FetchOptions & { params?: Record<string, any> } = {},
  ): Promise<T> => {
    const baseURL = environment.apiBaseUrl;
    let token = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken");

    if (!token) {
      console.warn("No token found, redirecting to login.");
      window.location.href = "/admin/login";
      return Promise.reject("No authentication token");
    }

    const defaultHeaders: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };

    if (!(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    // Xử lý query params
    const queryString = options.params ? buildQueryString(options.params) : "";
    const fullUrl = `${baseURL}${url}${queryString}`;

    const timeout = options.timeout || 10000; // Mặc định 10s
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) },
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!response.ok) {
        console.error(`Fetch error (${response.status}): ${response.statusText}`);

        if (response.status === 401) {
          console.warn("Unauthorized, clearing token and redirecting to login.");
          localStorage.removeItem("adminToken");
          sessionStorage.removeItem("adminToken");
          window.location.href = "/admin/login";
        } else if (response.status === 403) {
          console.warn("Forbidden access.");
          window.location.href = "/admin/forbidden";
        } else if (response.status === 500) {
          console.error("Server error, please try again later.");
        }
      }

      const contentType = response.headers.get("Content-Type") || "";

      if (contentType.includes("application/json")) {
        return response.json() as Promise<T>;
      } else if (contentType.includes("text")) {
        return response.text() as Promise<T>;
      } else {
        return response.blob() as Promise<T>;
      }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.error("Request timeout exceeded.");
        return Promise.reject(new Error("Request timeout exceeded."));
      }

      console.error("Fetch failed:", error);
      return Promise.reject(error);
    }
  };

  return fetchWithAuth;
};

export default useFetchWithAuth;
