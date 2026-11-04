import type { AxiosInstance, AxiosResponse,InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// expo-secure-store has no web implementation; the web build keeps tokens in localStorage.
const secureStore =
  Platform.OS === 'web'
    ? {
        getItemAsync: async (key: string) => globalThis.localStorage?.getItem(key) ?? null,
        setItemAsync: async (key: string, value: string) => globalThis.localStorage?.setItem(key, value),
        deleteItemAsync: async (key: string) => globalThis.localStorage?.removeItem(key),
      }
    : SecureStore;

const ACCESS_TOKEN_KEY = 'traction_access_token';
const REFRESH_TOKEN_KEY = 'traction_refresh_token';

let onAuthFailure: (() => void) | null = null;

export function setAuthFailureCallback(callback: () => void) {
  onAuthFailure = callback;
}

export interface ApiErrorResponse {
  data: null;
  meta: Record<string, unknown>;
  /** HTTP status, or undefined for network failures / timeouts. */
  status?: number;
  /** Same as error.message; kept at the top level for callers that read `err.message`. */
  message: string;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

const STATUS_CODES: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMITED',
};

/**
 * Convert any axios failure into one ApiErrorResponse shape. NestJS errors arrive as
 * { statusCode, message: string | string[], error: string }, which is not this shape, so they
 * must be translated rather than passed through.
 */
export function normalizeApiError(error: unknown): ApiErrorResponse {
  const err = error as {
    code?: string;
    message?: string;
    response?: { status?: number; data?: unknown };
  };
  const make = (
    code: string,
    message: string,
    status?: number,
    details?: Record<string, unknown>,
  ) =>
    ({
      data: null,
      meta: {},
      status,
      message,
      error: { code, message, details },
    }) as ApiErrorResponse;

  if (!err?.response) {
    if (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT') {
      return make('TIMEOUT', 'Request timed out');
    }
    return make('NETWORK_ERROR', 'Network request failed');
  }

  const status = err.response.status;
  const body = (err.response.data ?? {}) as {
    message?: string | string[];
    error?: unknown;
  };

  // Already in our envelope shape.
  if (body.error && typeof body.error === 'object') {
    const e = body.error as { code?: string; message?: string; details?: Record<string, unknown> };
    const message = e.message || 'An unexpected error occurred';
    return make(e.code || STATUS_CODES[status ?? 0] || 'SERVER_ERROR', message, status, e.details);
  }

  const messages = Array.isArray(body.message) ? body.message : body.message ? [body.message] : [];
  const message =
    messages.join('\n') ||
    (typeof body.error === 'string' ? body.error : '') ||
    'An unexpected error occurred';
  const code =
    STATUS_CODES[status ?? 0] || (status && status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR');
  return make(code, message, status, messages.length > 1 ? { messages } : undefined);
}

/** 401s from these endpoints mean bad credentials or a dead session, not an expired access token. */
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await secureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setAccessToken(token: string): Promise<void> {
    try {
      await secureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } catch {
      console.error('Failed to store access token');
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await secureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      await secureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch {
      console.error('Failed to store refresh token');
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await secureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await secureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      console.error('Failed to clear tokens');
    }
  },
};

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export function setupInterceptors(client: AxiosInstance) {
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await tokenStorage.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config;

      const isAuthEndpoint = NO_REFRESH_PATHS.some((p) => originalRequest?.url?.startsWith(p));

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isAuthEndpoint
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await tokenStorage.getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await client.post('/auth/refresh', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          await tokenStorage.setAccessToken(accessToken);
          if (newRefreshToken) {
            await tokenStorage.setRefreshToken(newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);

          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          await tokenStorage.clearTokens();
          if (onAuthFailure) {
            onAuthFailure();
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(normalizeApiError(error));
    },
  );
}
