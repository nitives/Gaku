"use client";
import { useUser as GakuUser } from "@/hooks/useUser";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const { settings } = GakuUser();
  const userThemeColor = settings.data?.themeColor;

  // Fetch user settings and apply theme when component mounts
  useEffect(() => {
    const fetchAndApplyUserTheme = async () => {
      if (userThemeColor) {
        document.documentElement.style.setProperty(
          "--keyColor",
          userThemeColor
        );
      }
    };
    if (isLoaded && isSignedIn) {
      fetchAndApplyUserTheme();
    } else if (isLoaded && !isSignedIn) {
      // For non-signed in users, we use default theme
      document.documentElement.style.setProperty("--keyColor", "#5891fa");
    }
  }, [isLoaded, isSignedIn, userThemeColor]);

  // Function to fetch user settings and apply theme

  return <>{children}</>;
}
