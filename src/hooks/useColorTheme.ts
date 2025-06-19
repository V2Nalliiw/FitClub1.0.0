import { useEffect, useState } from "react";

type ColorTheme = "blue" | "green" | "purple" | "orange" | "red";

export function useColorTheme() {
  const [theme, setTheme] = useState<ColorTheme>(() => {
    // Try to get the theme from localStorage
    const savedTheme = localStorage.getItem("colorTheme") as ColorTheme;
    return savedTheme || "blue"; // Default to blue if no theme is saved
  });

  // Apply the theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
    // Save to localStorage for persistence
    localStorage.setItem("colorTheme", theme);
  }, [theme]);

  // Function to apply the theme to the document
  const applyTheme = (newTheme: ColorTheme) => {
    const root = document.documentElement;

    // Remove all existing theme classes
    root.classList.remove(
      "theme-blue",
      "theme-green",
      "theme-purple",
      "theme-orange",
      "theme-red",
    );

    // Add the new theme class
    root.classList.add(`theme-${newTheme}`);
  };

  // Function to revert to the default theme
  const revertToDefault = () => {
    setTheme("blue");
  };

  return { theme, setTheme, revertToDefault };
}
