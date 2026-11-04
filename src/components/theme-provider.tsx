"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes";

function ThemeWatcher({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    // If an obsolete theme (e.g. japanese, cyberpunk, etc.) is in localStorage, migrate to dark
    if (theme && theme !== "dark" && theme !== "light") {
      setTheme("dark");
    }
  }, [theme, setTheme]);

  return <>{children}</>;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={["class", "data-theme"]}
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      themes={["dark", "light"]}
      {...props}
    >
      <ThemeWatcher>{children}</ThemeWatcher>
    </NextThemesProvider>
  );
}
