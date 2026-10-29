import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/api/client";

const POLL_MS = 45_000;
const HouseholdContext = createContext(null);

export function HouseholdProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      const response = await api.get("/household");
      setData(response.data);
      setError("");
      setStatus("ready");
    } catch (err) {
      const message = err.response?.data?.message || "לא הצלחנו לקרוא את הגיליון";
      setData(null);
      setError(message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await api.get("/household");
        if (cancelled) return;
        setData(response.data);
        setError("");
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        const message = err.response?.data?.message || "לא הצלחנו לקרוא את הגיליון";
        setData(null);
        setError(message);
        setStatus("error");
      }
    }

    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <HouseholdContext.Provider value={{ status, data, error, reload }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const value = useContext(HouseholdContext);
  if (!value) throw new Error("useHousehold must be used inside HouseholdProvider");
  return value;
}
