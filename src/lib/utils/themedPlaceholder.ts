"use client";
import { useState, useEffect } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

/**
 * Hook that returns the correct "themed" default image
 * based on <html style="color-scheme: dark/light;">.
 * It also sets a default to dark, if we can't detect anything yet.
 */
export function useThemedPlaceholder() {
  // 1) Decide initial default if we can't read style, prefer "dark"
  let isDarkPreferred = true;

  if (typeof document !== "undefined") {
    const scheme = document.documentElement.style.colorScheme;
    if (scheme && scheme.toLowerCase() === "light") {
      isDarkPreferred = false;
    }
  }

  // 2) Create our initial state
  const [defaultImage, setDefaultImage] = useState<string>(
    isDarkPreferred ? PLACEHOLDER_IMAGE.dark.url : PLACEHOLDER_IMAGE.light.url
  );

  useEffect(() => {
    // onMount check again in case we can read style now
    const scheme = document.documentElement.style.colorScheme;
    if (scheme.toLowerCase() === "light") {
      setDefaultImage(PLACEHOLDER_IMAGE.light.url);
    } else {
      setDefaultImage(PLACEHOLDER_IMAGE.dark.url);
    }

    // 3) Observe changes to the 'style' attribute on <html>
    const observer = new MutationObserver(() => {
      const schemeNow = document.documentElement.style.colorScheme;
      const isDark = schemeNow.toLowerCase() === "dark";
      setDefaultImage(
        isDark ? PLACEHOLDER_IMAGE.dark.url : PLACEHOLDER_IMAGE.light.url
      );
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"], // watch for style changes
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return defaultImage;
}
