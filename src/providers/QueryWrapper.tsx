"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type ReactQueryWrapperProps = {
  children: React.ReactNode;
};

export default function ReactQueryWrapper({
  children,
}: ReactQueryWrapperProps) {
  // Create one client instance for the entire app
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
