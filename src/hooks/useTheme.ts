import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const THEME_KEY = "theme";

const getSystemTheme = (): "light" | "dark" => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme: "light" | "dark") => {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

const getEffectiveTheme = (theme: Theme): "light" | "dark" => {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
};

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme;
    return savedTheme || "system";
  });

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme;
    return getEffectiveTheme(savedTheme || "system");
  });

  useEffect(() => {
    const newEffectiveTheme = getEffectiveTheme(theme);
    setEffectiveTheme(newEffectiveTheme);
    applyTheme(newEffectiveTheme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const newEffectiveTheme = getSystemTheme();
        setEffectiveTheme(newEffectiveTheme);
        applyTheme(newEffectiveTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    // Listen for theme changes from other tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_KEY && e.newValue) {
        const newTheme = e.newValue as Theme;
        setThemeState(newTheme);
      }
    };

    // Listen for custom theme change events
    const handleThemeChange = (e: CustomEvent<Theme>) => {
      setThemeState(e.detail);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("themeChange", handleThemeChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "themeChange",
        handleThemeChange as EventListener,
      );
    };
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    // Dispatch custom event for same-tab theme changes
    window.dispatchEvent(new CustomEvent("themeChange", { detail: newTheme }));
  };

  return {
    theme,
    effectiveTheme,
    setTheme,
    isDark: effectiveTheme === "dark",
  };
};

// Initialize theme on app startup
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem(THEME_KEY) as Theme;
  const theme = savedTheme || "system";
  const effectiveTheme = getEffectiveTheme(theme);
  applyTheme(effectiveTheme);
};
