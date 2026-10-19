import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import { tokenStorage } from "./tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!tokenStorage.get()) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const response = await api.get("/auth/me");
        if (!cancelled) setUser(response.data.user);
      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 403) tokenStorage.clear();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loginWithGoogle(credential) {
    try {
      const response = await api.post("/auth/google", { credential });
      tokenStorage.set(response.data.token);
      setUser(response.data.user);
    } catch (error) {
      const message = error.response?.data?.message || "ההתחברות נכשלה";
      throw new Error(message, { cause: error });
    }
  }

  function logout() {
    tokenStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
