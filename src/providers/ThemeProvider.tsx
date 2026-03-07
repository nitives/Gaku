"use client";
import { useLocalSettings } from "@/hooks/useLocalSettings";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, loaded } = useLocalSettings();

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.style.setProperty(
      "--keyColor",
      settings.themeColor,
    );
  }, [loaded, settings.themeColor]);

  return <>{children}</>;
}
