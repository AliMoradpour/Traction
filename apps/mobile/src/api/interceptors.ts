import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiErrorResponse {
  data: null;
  meta: Record<string, unknown>;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function setupInterceptors(client: AxiosInstance) {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // TODO: Attach access token from SecureStore
      // const token = await SecureStore.getItemAsync('accessToken');
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // TODO: Implement token refresh logic
          // const refreshToken = await SecureStore.getItemAsync('refreshToken');
          // const response = await client.post('/auth/refresh', { refreshToken });
          // const { accessToken } = response.data.data;
          // await SecureStore.setItemAsync('accessToken', accessToken);
          // originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          // return client(originalRequest);
          return Promise.reject(error);
        } catch (refreshError) {
          // TODO: Clear auth state and redirect to login
          return Promise.reject(refreshError);
        }
      }

      // Normalize error response
      const apiError: ApiErrorResponse = error.response?.data || {
        data: null,
        meta: {},
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        },
      };

      return Promise.reject(apiError);
    }
  );
}
