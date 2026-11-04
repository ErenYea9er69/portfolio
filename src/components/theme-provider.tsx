"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes";

function ThemeWatcher({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => {
    // If an obsolete theme (e.g. japanese, cyberpunk, etc.) is in localStorage, migrate to dark
    if (theme && theme !== "dark" && theme !== "light") {
      setTheme("dark");
      return;
    }

    const currentTheme = theme === "light" || resolvedTheme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    if (currentTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme, resolvedTheme, setTheme]);

  return <>{children}</>;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={["dark", "light"]}
      {...props}
    >
      <ThemeWatcher>{children}</ThemeWatcher>
    </NextThemesProvider>
  );
}
