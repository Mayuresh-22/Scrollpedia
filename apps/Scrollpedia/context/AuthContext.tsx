import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/services/supabase";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const login = async () => {
    setIsAuthenticated(true);
    router.replace("/(tabs)/home");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    router.replace("/(auth)");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
