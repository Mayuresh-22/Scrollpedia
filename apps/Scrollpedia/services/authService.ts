// so this is auth service for the app
// and we will be making supabase auth calls from app itself

import BaseService from "@/services/baseService";
import { supabase } from "@/services/supabase";

export interface BackendUserData {
  id: string;
  contentPreferences: string[];
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
        console.log("Error logging in with supabase", error);
        return null;
      }
      // now get user data (content-preferences) from our backend
      const userData: BackendUserData = await this.backend.get("/user");
      return userData;
    } catch (error) {
      console.log("Promise rejected with error:", error);
      return Promise.reject(error);
    }
  }

  async signUp(username: string, email: string, password: string, contentPreferences: string[]) {
    try {
      // sign up with supabase then,
      const { data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      if (!data) {
        console.log("Error signing up with supabase");
        return null;
      }
      // now store user data in our backend
      const userData: BackendUserData = await this.backend.post("/user", {
        contentPreferences
      });
      return userData;
    } catch (error) {
      console.log("Promise rejected with error:", error);
      return Promise.reject(error);
    }
  }

  async logout() {
    try {
      const { data } = await this.backend.post("/auth/logout");
      return data;
    } catch (error) {
      console.log("Promise rejected with error:", error);
      return Promise.reject(error);
    }
  }
}

export default new AuthService();
