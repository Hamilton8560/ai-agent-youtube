import { getTemporaryAccessToken } from "@/actions/getTemporaryAccessToken";
import { Suspense } from "react";
import SchematicEmbed from "./SchematicEmbed";

function LoadingFallback() {
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-md animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}

async function SchematicComponentInner({ componentId }: { componentId: string }) {
  if (!componentId) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">Invalid component configuration.</p>
      </div>
    );
  }

  try {
    // Get access token
    const accessToken = await getTemporaryAccessToken();

    if (!accessToken) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">
            Authentication failed. Please ensure you are logged in and try again.
          </p>
        </div>
      );
    }

    return <SchematicEmbed accessToken={accessToken} componentId={componentId} />;
  } catch (error) {
    console.error("Error loading Schematic component:", error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">
          Failed to load subscription component. Error: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}

function SchematicComponent({ componentId }: { componentId: string }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SchematicComponentInner componentId={componentId} />
    </Suspense>
  );
}

export default SchematicComponent;
