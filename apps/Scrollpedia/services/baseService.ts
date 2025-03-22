// this base service serves as a base class for all services
// so please make changes cuatiously, if not be ready to clean up the mess
import { getItem } from '@/utils/AsyncStorage';
import axios, { AxiosInstance } from 'axios';
import { supabase } from './supabase';

class BaseService {
  backend: AxiosInstance;

  constructor() {
    this.backend = axios.create({
      baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.backend.interceptors.request.use(async (config) => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        config.headers.Authorization = `Bearer ${data.session?.access_token}`;
      }
      return config;
    });

    this.backend.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response.status === 401) {
          // we will just trigger a logout event here, team: add retry logic afterword yarr
        }
        return Promise.reject(error);
      },
    );
  }
}

export default BaseService;
