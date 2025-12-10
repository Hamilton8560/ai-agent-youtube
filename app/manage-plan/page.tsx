import SchematicComponent from "@/components/schematic/SchematicComponent";
import { Suspense } from "react";

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}

function ErrorBoundaryFallback() {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-lg font-semibold text-red-800 mb-2">Unable to load subscription management</h2>
      <p className="text-red-600 mb-4">
        We're having trouble loading your subscription details. This might be due to:
      </p>
      <ul className="list-disc list-inside text-red-600 space-y-1 mb-4">
        <li>Network connectivity issues</li>
        <li>Authentication problems</li>
        <li>Service temporarily unavailable</li>
      </ul>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  );
}

function ManagePlan() {
  return (
    <div className="container mx-auto p-4 md:p-0">
      <h1 className="text-2xl font-bold mb-4 my-8">Manage Your Plan</h1>
      <p className="text-gray-600 mb-8">
        Manage your subscription and billing details here.
      </p>

      <Suspense fallback={<LoadingState />}>
        <SchematicComponent componentId="cmpn_HqmQgykvb5R" />
      </Suspense>
    </div>
  );
}

export default ManagePlan;
