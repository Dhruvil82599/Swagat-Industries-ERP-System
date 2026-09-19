import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("swagat_erp_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("swagat_erp_token"));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token && user);

  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem("swagat_erp_token");
      if (!savedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const userData = await authAPI.getMe();
        setUser(userData);
        localStorage.setItem("swagat_erp_user", JSON.stringify(userData));
      } catch (err) {
        console.warn("Session expired or invalid token:", err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();

    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener("swagat_auth_expired", handleAuthExpired);
    return () => {
      window.removeEventListener("swagat_auth_expired", handleAuthExpired);
    };
  }, []);

  const login = async (username, password) => {
    const data = await authAPI.login({ username, password });

    const { token: newToken, user: userData } = data;

    localStorage.setItem("swagat_erp_token", newToken);
    localStorage.setItem("swagat_erp_user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("swagat_erp_token");
    localStorage.removeItem("swagat_erp_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
