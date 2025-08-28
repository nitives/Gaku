"use client";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

type ReactQueryWrapperProps = {
  children: React.ReactNode;
};

export default function ReactQueryWrapper({
  children,
}: ReactQueryWrapperProps) {
  // Create one client instance for the entire app
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Keep sensible defaults; specific hooks override as needed
            retry: 1,
          },
        },
      })
  );

  // Expose client for non-hook utility usage where we still want to reuse cache
  useEffect(() => {
    (globalThis as any).__REACT_QUERY_CLIENT__ = queryClient;
    return () => {
      if ((globalThis as any).__REACT_QUERY_CLIENT__ === queryClient) {
        delete (globalThis as any).__REACT_QUERY_CLIENT__;
      }
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
