"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes";

function ThemeWatcher({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme();

  React.useEffect(() => {
    const currentTheme = theme || resolvedTheme || "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
    if (currentTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme, resolvedTheme]);

  return <>{children}</>;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      themes={["dark", "japanese", "minecraft", "cyberpunk", "e33", "light"]}
      {...props}
    >
      <ThemeWatcher>{children}</ThemeWatcher>
    </NextThemesProvider>
  );
}
