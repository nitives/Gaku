"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  // Fetch user settings and apply theme when component mounts
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchAndApplyUserTheme();
    } else if (isLoaded && !isSignedIn) {
      // For non-signed in users, we use default theme
      document.documentElement.style.setProperty("--keyColor", "#5891fa");
    }
  }, [isLoaded, isSignedIn]);

  const fetchAndApplyUserTheme = async () => {
    try {
      const response = await fetch("/api/user/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.themeColor) {
          document.documentElement.style.setProperty(
            "--keyColor",
            data.themeColor
          );
        }
      }
    } catch (error) {
      console.error("Failed to load user theme settings:", error);
    }
  };

  return <>{children}</>;
}
