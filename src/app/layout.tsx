import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/mobile/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import type { Viewport } from "next";
import { AudioProvider } from "@/context/AudioContext";
import { PersistentAudioPlayer } from "@/components/PersistentAudioPlayer";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gaku",
  description: "A SoundCloud Client",
  applicationName: "Gaku",
  appleWebApp: {
    capable: true,
    title: "Gaku",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  // themeColor: [
  //   { media: "(prefers-color-scheme: light)", color: "white" },
  //   { media: "(prefers-color-scheme: dark)", color: "black" },
  // ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={"SFPro"}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AudioProvider>
            {children}
            <Navbar />
            <PersistentAudioPlayer />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  padding: "16px",
                  borderRadius: "16px",
                },
                success: {
                  duration: 3000,
                },
                error: {
                  duration: 4000,
                },
              }}
            />
          </AudioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
