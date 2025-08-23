import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

const PrivateRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) => {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/login" />;

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/403" />;
  }

  return <>{children}</>; 
};

export default PrivateRoute;
