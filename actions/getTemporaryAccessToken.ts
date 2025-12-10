"use server";

import { currentUser } from "@clerk/nextjs/server";
import { SchematicClient } from "@schematichq/schematic-typescript-node";

const apiKey = process.env.SCHEMATIC_API_KEY;

// Only create the client if the API key is available
const client = apiKey
  ? new SchematicClient({
      apiKey,
    })
  : null;

export async function getTemporaryAccessToken() {
  try {
    // Return early if Schematic is not configured
    if (!client) {
      console.warn("SCHEMATIC_API_KEY is not configured - Schematic features will be disabled");
      return null;
    }

    const user = await currentUser();

    if (!user) {
      console.warn("No authenticated user found when requesting Schematic access token");
      return null;
    }

    console.log("Requesting Schematic access token for user:", user.id);
    
    const response = await client.accesstokens.issueTemporaryAccessToken({
      resourceType: "company",
      lookup: {
        id: user.id,
      },
    });

    if (!response?.data?.token) {
      console.error("Invalid response from Schematic API - no token received");
      return null;
    }

    console.log("Successfully obtained Schematic access token");
    return response.data.token;
  } catch (error) {
    console.error("Error getting Schematic temporary access token:", error);
    
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Stack trace:", error.stack);
    }
    
    // Return null instead of throwing to allow graceful error handling
    return null;
  }
}
