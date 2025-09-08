import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/api/auth/profile");
          setUser(res.data);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    
    // Use user data from login response if available, otherwise fetch profile
    if (res.data.user) {
      setUser(res.data.user);
    } else {
      const profile = await api.get("/api/auth/profile");
      setUser(profile.data);
    }
  };

  const register = async (data) => {
    const res = await api.post("/api/auth/register", data);
    localStorage.setItem("token", res.data.token);
    
    // Use user data from register response if available, otherwise fetch profile
    if (res.data.user) {
      setUser(res.data.user);
    } else {
      const profile = await api.get("/api/auth/profile");
      setUser(profile.data);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
