import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Home } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import GoogleButton from "@/components/GoogleButton";
import { PageLoading } from "@/components/skeletons";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (loading) return <PageLoading />;
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="card w-full max-w-sm text-center">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
          <Home size={20} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="type-title">הבית שלנו</h1>
        <p className="mt-2 type-body text-ink-muted">הכניסה פתוחה רק לרועי ולאביב.</p>

        {!clientId ? (
          <p className="mt-6 rounded-md bg-coral-soft px-3 py-3 type-body text-coral-strong" role="alert">
            חסר VITE_GOOGLE_CLIENT_ID
          </p>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-md bg-coral-soft px-3 py-3 type-body text-coral-strong" role="alert">
            <p>{error}</p>
            <Button variant="destructive" className="mt-3" onClick={() => setError("")}>
              נסה שוב
            </Button>
          </div>
        ) : null}

        <div className="mt-6 flex justify-center">
          <GoogleButton onError={setError} />
        </div>
      </div>
    </div>
  );
}
