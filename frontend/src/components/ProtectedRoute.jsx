import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { PageLoading } from "@/components/skeletons";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
