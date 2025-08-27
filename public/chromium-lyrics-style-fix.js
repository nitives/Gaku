function isChromiumBasedBrowser() {
  try {
    const userAgent = navigator?.userAgent?.toLowerCase();
    if (!userAgent) return false;

    return (
      userAgent.includes("chrome") ||
      userAgent.includes("chromium") ||
      userAgent.includes("edg")
    );
  } catch (error) {
    console.warn("Failed to detect browser type:", error);
    return false;
  }
}

function applyChromiumStyles() {
  try {
    if (isChromiumBasedBrowser()) {
      const style = document.createElement("style");
      style.textContent = `
        /* Target any class starting with lyricLine- */
        [class^="lyricLine-"],
        [class^="lyricPlayer-"] {
          will-change: auto !important;
        }

        /* Target all children of any lyricLine- class */
        [class^="lyricLine-"] * {
          will-change: auto !important;
        }

        /* Target spans inside any class starting with lyricMainLine- */
        [class^="lyricMainLine-"] span {
          display: inline !important;
        }
      `;

      if (document.head) {
        document.head.appendChild(style);
      } else {
        console.warn("Document head not available for style injection");
      }
    }
  } catch (error) {
    console.error("Failed to apply Chromium styles:", error);
  }
}

// Run on page load and handle dynamic content
try {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyChromiumStyles);
  } else {
    applyChromiumStyles();
  }
} catch (error) {
  console.error("Failed to set up DOMContentLoaded listener:", error);
}

// Optional: Re-run if the DOM changes (e.g., via MutationObserver for dynamic content)
try {
  if (typeof MutationObserver !== "undefined" && document.body) {
    const observer = new MutationObserver(() => {
      try {
        applyChromiumStyles();
      } catch (error) {
        console.error("Failed to apply styles during mutation:", error);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
} catch (error) {
  console.error("Failed to set up MutationObserver:", error);
}
