import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // Retrieve the user object
  const location = useLocation();

  // 1. Check if logged in
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check if the role is specifically 'admin'
  if (user?.role !== "admin") {
    // If they are a regular user trying to access /admin, send them to their profile or home
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default AdminProtectedRoute;