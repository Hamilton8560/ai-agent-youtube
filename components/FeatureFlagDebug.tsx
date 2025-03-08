"use client";

import { FeatureFlag } from "@/features/flags";
import { useSchematicFlag } from "@schematichq/schematic-react";
import { useEffect } from "react";

export default function FeatureFlagDebug() {
  const isScriptGenerationEnabled = useSchematicFlag(
    FeatureFlag.SCRIPT_GENERATION
  );
  const isImageGenerationEnabled = useSchematicFlag(
    FeatureFlag.IMAGE_GENERATION
  );
  const isTitleGenerationEnabled = useSchematicFlag(
    FeatureFlag.TITLE_GENERATIONS
  );

  useEffect(() => {
    console.log("Feature Flags Status:", {
      isScriptGenerationEnabled,
      isImageGenerationEnabled,
      isTitleGenerationEnabled,
    });
  }, [
    isScriptGenerationEnabled,
    isImageGenerationEnabled,
    isTitleGenerationEnabled,
  ]);

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-2 right-2 bg-black bg-opacity-80 text-white p-4 rounded text-xs z-50">
      <h3 className="font-bold mb-2">Feature Flag Status:</h3>
      <ul>
        <li>Script: {isScriptGenerationEnabled ? "✅" : "❌"}</li>
        <li>Image: {isImageGenerationEnabled ? "✅" : "❌"}</li>
        <li>Title: {isTitleGenerationEnabled ? "✅" : "❌"}</li>
      </ul>
    </div>
  );
}
