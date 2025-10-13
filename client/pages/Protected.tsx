import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Protected() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/signin" replace />;
  return <Outlet />;
}
