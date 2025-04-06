import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { createContext, useContext, useEffect, useState } from "react";

// --- AuthContext.tsx ---
interface AuthContextType {
  roles: string[];
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const isAuthen = localStorage.getItem("adminToken") || sessionStorage.getItem("adminToken")
    if(isAuthen) 
      setIsAuthenticated(true);

    const storedRoles = localStorage.getItem("adminRoles") || sessionStorage.getItem("adminRoles");
    if (storedRoles)
      setRoles(JSON.parse(storedRoles));

    setLoading(false); // Khi dữ liệu đã load xong
  }, []);

  return (
    <AuthContext.Provider value={{ roles, isAuthenticated, loading }}>
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