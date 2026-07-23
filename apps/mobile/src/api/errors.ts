export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

export class NetworkError extends Error {
  constructor(message: string = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Session expired') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends Error {
  public details: Record<string, string[]>;
  constructor(message: string = 'Validation failed', details: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class ServerError extends Error {
  public status: number;
  constructor(message: string = 'Server error', status: number = 500) {
    super(message);
    this.name = 'ServerError';
    this.status = status;
  }
}

export function parseApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'error' in error) {
    const apiErr = error as { error: { code: string; message: string; details?: Record<string, unknown> }; status?: number };
    return {
      code: apiErr.error.code || 'UNKNOWN_ERROR',
      message: apiErr.error.message || 'An unexpected error occurred',
      status: apiErr.status,
      details: apiErr.error.details,
    };
  }

  if (error instanceof NetworkError) {
    return { code: 'NETWORK_ERROR', message: error.message };
  }

  if (error instanceof TimeoutError) {
    return { code: 'TIMEOUT', message: error.message };
  }

  if (error instanceof UnauthorizedError) {
    return { code: 'UNAUTHORIZED', message: error.message };
  }

  if (error instanceof ValidationError) {
    return { code: 'VALIDATION_ERROR', message: error.message, details: error.details };
  }

  if (error instanceof ServerError) {
    return { code: 'SERVER_ERROR', message: error.message, status: error.status };
  }

  if (error instanceof Error) {
    return { code: 'UNKNOWN_ERROR', message: error.message };
  }

  return { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
}

export function getErrorMessage(error: unknown): string {
  const apiError = parseApiError(error);
  return apiError.message;
}

export function isNetworkError(error: unknown): boolean {
  return parseApiError(error).code === 'NETWORK_ERROR';
}

export function isTimeoutError(error: unknown): boolean {
  return parseApiError(error).code === 'TIMEOUT';
}

export function isUnauthorizedError(error: unknown): boolean {
  return parseApiError(error).code === 'UNAUTHORIZED';
}

export function isValidationError(error: unknown): boolean {
  return parseApiError(error).code === 'VALIDATION_ERROR';
}
