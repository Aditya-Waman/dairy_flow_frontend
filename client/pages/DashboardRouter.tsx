import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/signin" replace />;
  return <Navigate to={user.role === "superadmin" ? "/dashboard/superadmin" : "/dashboard/admin"} replace />;
}
