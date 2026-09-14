export const BASE_URL = import.meta.env.VITE_API_URL;

export function putAccessToken(token: string): void {
  localStorage.setItem("accessToken", token);
}

export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function putRefreshToken(token: string): void {
  localStorage.setItem("refreshToken", token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

export function clearAccessToken(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function asyncRefreshToken(
  refreshToken: string
): Promise<{ accessToken: string }> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const responseJson = await response.json();

    if (responseJson.status === "success") {
      const { accessToken } = responseJson.data;
      putAccessToken(accessToken);
      return { accessToken };
    }

    throw new Error(responseJson.message || "Failed to refresh token");
  } catch (error) {
    console.error("Error refreshing token:", error);
    clearAccessToken();
    throw error;
  }
}

export async function _fetchWithAuth(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const newTokens = await asyncRefreshToken(refreshToken);
      if (!newTokens) {
        throw new Error("Failed to refresh token");
      }

      // Retry the original request with the new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newTokens.accessToken}`,
        },
      });
    }

    return response;
  } catch (error) {
    console.error("Error in _fetchWithAuth:", error);
    throw error;
  }
}

export async function _uploadWithAuth(
  url: string,
  options: {
    method?: string;
    body: FormData;
    headers?: Record<string, string>;
    onUploadProgress?: (progressEvent: ProgressEvent) => void;
  }
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let isRetrying = false;

    const doRequest = (token: string | null) => {
      xhr.open(options.method || "POST", url);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      if (options.headers) {
        Object.keys(options.headers).forEach((key) => {
          xhr.setRequestHeader(key, options.headers![key]);
        });
      }

      if (options.onUploadProgress) {
        xhr.upload.onprogress = options.onUploadProgress;
      }

      xhr.onload = async () => {
        if (xhr.status === 401 && !isRetrying) {
          isRetrying = true;
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            return reject(new Error("No refresh token available"));
          }
          try {
            const newTokens = await asyncRefreshToken(refreshToken);
            if (!newTokens) {
              return reject(new Error("Failed to refresh token"));
            }
            doRequest(newTokens.accessToken);
          } catch (error) {
            reject(error);
          }
        } else if (xhr.status >= 200 && xhr.status < 300) {
          // Construct a mock Response object for compatibility with fetch style
          const response = new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
          });
          resolve(response);
        } else {
          // Try to construct a response with error data
          const response = new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
          });
          resolve(response); // resolve so we can handle !response.ok upstream
        }
      };

      xhr.onerror = () => reject(new Error("Network Error"));
      xhr.send(options.body);
    };

    doRequest(getAccessToken());
  });
}
