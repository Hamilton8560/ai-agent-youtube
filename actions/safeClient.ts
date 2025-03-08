"use server";

import { api } from "@/convex/_generated/api";
import { FeatureFlag } from "@/features/flags";
import { getConvexClient } from "@/lib/convex";
import { client as schematicClient } from "@/lib/schematic";

// Safely get clients in a way that won't break builds
export async function getSafeClients() {
  // Make a safe version of convex client
  let convexClient;
  try {
    convexClient = getConvexClient();
  } catch (error) {
    console.warn("Failed to initialize Convex client, using mock", error);
    convexClient = {
      query: () => Promise.resolve(null),
      mutation: () => Promise.resolve(null),
    };
  }

  // Make a safe version of schematic client
  let safeSchematicClient;
  try {
    safeSchematicClient = schematicClient;
  } catch (error) {
    console.warn("Failed to initialize Schematic client, using mock", error);
    safeSchematicClient = {
      checkFlag: async () => ({ enabled: true, reason: "Mock client" }),
      evalFlag: async () => true,
      track: async () => {},
      feature: {
        checkFlag: async () => ({ enabled: true, reason: "Mock client" }),
        evalFlag: async () => true,
      },
    };
  }

  return {
    convex: convexClient,
    schematic: safeSchematicClient,
  };
}
