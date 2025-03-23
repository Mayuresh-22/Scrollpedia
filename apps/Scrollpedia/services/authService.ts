// so this is auth service for the app
// and we will be making supabase auth calls from app itself

import BaseService from "@/services/baseService";
import { supabase } from "@/services/supabase";
import { AxiosError } from "axios";

export interface BackendUserData {
  user_id: string;
  preferences: string[];
}

class AuthService extends BaseService {
  async login(email: string, password: string) {
    try {
      // try supabase login first and then,
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        console.log("AuthService: Error logging in with supabase", error);
        return null;
      }
      // now get user data (content-preferences) from our backend
      const userData = await this.backend.get("/user");
      return userData.data.data as BackendUserData;
    } catch (error) {
      console.log("AuthService: Promise rejected with error:", error);
      return Promise.reject(error);
    }
  }

  async signUp(username: string, email: string, password: string, preferences: string[]) {
    try {
      // sign up with supabase first and then,
      const { data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      console.log("AuthService: Supabase sign up data:", data);
      
      if (!data) {
        console.log("AuthService: Error signing up with supabase");
        return null;
      }
      // now store user data in our backend
      const userData = await this.backend.post("/user", {
        user_id: data.user?.id,
        preferences
      });
      return userData.data as BackendUserData;
    } catch (error) {
      if ((error as AxiosError).response?.data) {
        console.log("AuthService: Sign up promise rejected with error:", (error as AxiosError).response?.data);
      }
      console.log("AuthService: Sign up promise rejected with error:", error);
      return Promise.reject(error);
    }
  }

  async logout() {
    try {
      const { data } = await this.backend.post("/auth/logout");
      return data;
    } catch (error) {
      console.log("AuthService: Promise rejected with error:", error);
      return Promise.reject(error);
    }
  }
}

export default new AuthService();
