// Common API response types that can be reused across all API modules

/**
 * Generic success response wrapper for API calls
 * @template T - The type of data returned in the response
 */
export interface ApiSuccessResponse<T> {
  status: "success";
  message: string;
  data: T;
}

/**
 * Error response structure for failed API calls
 */
export interface ApiErrorResponse {
  status: "error";
  message: string;
  data?: {
    errors?: string[];
  };
}

/**
 * Union type representing all possible API response types
 * @template T - The type of data returned in successful responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
