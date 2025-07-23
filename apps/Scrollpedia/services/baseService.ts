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
        config.headers.Authorization = `${data.session?.access_token}`;
        config.headers["X-Refresh-Token"] = `${data.session?.refresh_token}`;
      }
      return config;
    });

    this.backend.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.log("Error in response interceptor:", error);
        return Promise.reject(error);
      },
    );
  }
}

export default BaseService;
