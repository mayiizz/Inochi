import { useCallback, useEffect, useState } from "react";
import { applyTheme, readStoredTheme, toggleTheme, type Theme } from "@/lib/theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = readStoredTheme();
    applyTheme(stored);
    setTheme(stored);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => toggleTheme(current));
  }, []);

  return { theme, toggle, isDark: theme === "dark" };
}
