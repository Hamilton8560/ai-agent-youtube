import { SchematicClient } from "@schematichq/schematic-typescript-node";

// Only create the client if the API key is available
// This allows the build to succeed even without the key
export const client = process.env.SCHEMATIC_API_KEY
  ? new SchematicClient({
      apiKey: process.env.SCHEMATIC_API_KEY,
      cacheProviders: {
        flagChecks: [],
      },
    })
  : null;
