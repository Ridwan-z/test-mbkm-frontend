import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";


type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const STORAGE_KEY = "token";

const saveToken = (token: string, remember: boolean) => {
  if (remember) {
    localStorage.setItem(STORAGE_KEY, token);
  } else {
    sessionStorage.setItem(STORAGE_KEY, token);
  }
};

const getToken = () => {
  return (
    localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
  );
};

const clearToken = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tokenFromStorage = getToken();

    if (!tokenFromStorage) {
      setIsLoading(false);
      logout(); 
      return;
    }

    setToken(tokenFromStorage);
    api.defaults.headers.common["Authorization"] = `Bearer ${tokenFromStorage}`;

    const initialize = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data);
      } catch {
        try {
          const refreshRes = await api.post("/auth/refresh");
          const newToken = refreshRes.data.data.access_token;
          const remember = !!localStorage.getItem(STORAGE_KEY);
          saveToken(newToken, remember);
          setToken(newToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          const meRes = await api.get("/auth/me");
          setUser(meRes.data.data);
        } catch {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    const res = await api.post("/auth/login", { email, password });
    const newToken = res.data.data.access_token;
    setToken(newToken);
    saveToken(newToken, remember);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setUser(res.data.data.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
