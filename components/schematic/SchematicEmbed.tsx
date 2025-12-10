"use client";

import { SchematicEmbed as SchematicEmbedComponent } from "@schematichq/schematic-components";
import { useEffect, useState } from "react";

const SchematicEmbed = ({
  accessToken,
  componentId,
}: {
  accessToken: string;
  componentId: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!accessToken || !componentId) {
      setHasError(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [accessToken, componentId]);

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">
          Failed to load subscription component. Please try refreshing the page.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  try {
    return <SchematicEmbedComponent accessToken={accessToken} id={componentId} />;
  } catch (error) {
    console.error("Error rendering Schematic component:", error);
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">
          Unable to display subscription options at this time. Please contact support if the issue persists.
        </p>
      </div>
    );
  }
};

export default SchematicEmbed;
