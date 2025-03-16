"use client";
import { useEffect, useState } from "react";
import { Heading, SafeView, SubHeading } from "@/components/mobile/SafeView";
import { useRouter } from "next/navigation";
import { IoCloudOffline, IoRefresh } from "react-icons/io5";

export default function Offline() {
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    if (isOnline) {
      router.refresh();
    }
  };

  return (
    <>
      <SafeView>
        <Heading>Gaku</Heading>
        <SubHeading className="mb-6">
          {isOnline ? "You're back online!" : "You're currently offline"}
        </SubHeading>
        <div className="flex flex-col items-center justify-center space-y-6">
          <IoCloudOffline className="text-3xl text-muted-foreground" />
          <p className="text-center text-muted-foreground">
            {isOnline
              ? "Your internet connection has been restored. You can now use all features of the app."
              : "It looks like you're offline. Some features may be unavailable until you reconnect."}
          </p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!isOnline}
          >
            <IoRefresh className="text-lg" />
            Refresh
          </button>
        </div>
      </SafeView>
    </>
  );
}
