"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

// Safely create Convex client with fallback for build time
const createConvexClient = () => {
  // Check if URL exists and is a string
  if (
    typeof process.env.NEXT_PUBLIC_CONVEX_URL === "string" &&
    process.env.NEXT_PUBLIC_CONVEX_URL
  ) {
    return new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  }

  // For build time, return a mocked client
  if (typeof window === "undefined") {
    console.warn("NEXT_PUBLIC_CONVEX_URL is not set, using mock client");
    return {} as ConvexReactClient;
  }

  // In browser, we'll expect the env var to be set
  return new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL || "https://example.convex.cloud"
  );
};

export const convex = createConvexClient();

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
