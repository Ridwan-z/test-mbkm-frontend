import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

const PrivateRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode; // ✅ ganti ini
  roles?: string[];
}) => {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/login" />;

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/403" />;
  }

  return <>{children}</>; // ✅ bungkus di fragment biar aman
};

export default PrivateRoute;
