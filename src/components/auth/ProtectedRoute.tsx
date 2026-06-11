import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FullScreenSpinner } from "@/components/ui/Spinner";

export function ProtectedRoute() {
  const { isAdmin, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
