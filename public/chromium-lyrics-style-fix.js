function isChromiumBasedBrowser() {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("chrome") ||
    userAgent.includes("chromium") ||
    userAgent.includes("edg")
  );
}

function applyChromiumStyles() {
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
    document.head.appendChild(style);
  }
}

// Run on page load and handle dynamic content
document.addEventListener("DOMContentLoaded", applyChromiumStyles);
// Optional: Re-run if the DOM changes (e.g., via MutationObserver for dynamic content)
const observer = new MutationObserver(applyChromiumStyles);
observer.observe(document.body, { childList: true, subtree: true });
