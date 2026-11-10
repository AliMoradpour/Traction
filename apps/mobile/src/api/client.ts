import axios from 'axios';

import config from '@/lib/config';

import { setupInterceptors } from './interceptors';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  // Generous: the free hosted server sleeps when idle and can take ~50 s to wake up.
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(apiClient);
