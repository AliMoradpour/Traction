import axios from 'axios';
import config from '@/lib/config';
import { setupInterceptors } from './interceptors';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(apiClient);
