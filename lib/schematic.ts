import { SchematicClient } from "@schematichq/schematic-typescript-node";

// Use a default "mock" client when API key is not available (during build)
let client: SchematicClient;

if (
  typeof process.env.SCHEMATIC_API_KEY === "string" &&
  process.env.SCHEMATIC_API_KEY
) {
  // Only create a real client when API key is available
  client = new SchematicClient({
    apiKey: process.env.SCHEMATIC_API_KEY,
    cacheProviders: {
      flagChecks: [],
    },
  });
} else {
  // Create a mock client that logs errors but doesn't break builds
  console.warn("SCHEMATIC_API_KEY is not set, using mock client");
  client = {
    feature: {
      checkFlag: async () => ({
        enabled: true,
        reason: "Mock client (no API key)",
      }),
      evalFlag: async () => true,
    },
    // Add other required methods as needed
  } as unknown as SchematicClient;
}

export { client };
