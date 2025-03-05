"use client";
import { useUser as GakuUser } from "@/hooks/useUser";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const { settings } = GakuUser();
  const userThemeColor = settings?.themeColor;

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
    if (userThemeColor) {
      document.documentElement.style.setProperty("--keyColor", userThemeColor);
    }
  };

  return <>{children}</>;
}
