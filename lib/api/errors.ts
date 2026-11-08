export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

interface ErrorBody {
  error?: { code?: unknown; message?: unknown };
  detail?: unknown;
}

// The spec promises {"error": {...}}; FastAPI's own errors still send {"detail": ...}.
export async function toApiError(response: Response): Promise<ApiError> {
  let body: ErrorBody = {};
  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    // Non-JSON error page from a proxy: status alone still classifies it.
  }

  const code =
    typeof body.error?.code === "string" ? body.error.code : "http_error";
  const message =
    typeof body.error?.message === "string"
      ? body.error.message
      : typeof body.detail === "string"
        ? body.detail
        : `Request failed with status ${response.status}`;

  return new ApiError(response.status, code, message);
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

/** For page sections: logs the failure and lets the section render its own error. */
export async function settle<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    console.error(error);
    return null;
  }
}
