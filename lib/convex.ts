import { ConvexHttpClient } from "convex/browser";

type MockClient = {
  query: typeof ConvexHttpClient.prototype.query;
  mutation: typeof ConvexHttpClient.prototype.mutation;
};

// Create a client for server-side HTTP requests
export const getConvexClient = () => {
  if (
    typeof process.env.NEXT_PUBLIC_CONVEX_URL === "string" &&
    process.env.NEXT_PUBLIC_CONVEX_URL
  ) {
    return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  }

  // Return a mock client for build-time
  console.warn("NEXT_PUBLIC_CONVEX_URL is not set, using mock client");

  const mockClient: MockClient = {
    query: () => Promise.resolve(null),
    mutation: () => Promise.resolve(null),
  };

  return mockClient as ConvexHttpClient;
};
