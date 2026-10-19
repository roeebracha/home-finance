import { createContext, useContext, useEffect, useState } from "react";
import { applyTheme, getStoredTheme, resolveDark } from "@/lib/theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [resolved, setResolved] = useState(() => (resolveDark(getStoredTheme()) ? "dark" : "light"));

  function setTheme(next) {
    setThemeState(next);
    setResolved(applyTheme(next) ? "dark" : "light");
  }

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getStoredTheme() !== "system") return;
      setResolved(applyTheme("system") ? "dark" : "light");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
