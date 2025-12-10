"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TestResult {
  status: string;
  message: string;
}

interface ApiTestResults {
  claude: TestResult;
  openai: TestResult;
}

export default function ApiTestPage() {
  const [results, setResults] = useState<ApiTestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const testApis = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/test-ai");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">AI API Connection Test</h1>

      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button onClick={testApis} disabled={loading}>
            {loading ? "Testing..." : "Test AI Connections"}
          </Button>

          {error && <div className="text-red-500">Error: {error}</div>}
        </div>

        {results && (
          <div className="border rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold">Results</h2>

            <div className="space-y-4">
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">Claude API</h3>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${results.claude.status === "success"
                      ? "bg-green-500"
                      : "bg-red-500"
                      }`}
                  />
                  <span>
                    Status:{" "}
                    <span className="font-medium">{results.claude.status}</span>
                  </span>
                </div>
                <div className="mt-1">Message: {results.claude.message}</div>
              </div>

              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">OpenAI API</h3>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${results.openai.status === "success"
                      ? "bg-green-500"
                      : "bg-red-500"
                      }`}
                  />
                  <span>
                    Status:{" "}
                    <span className="font-medium">{results.openai.status}</span>
                  </span>
                </div>
                <div className="mt-1">Message: {results.openai.message}</div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">What to do next:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {results.claude.status !== "success" &&
                  results.openai.status !== "success" && (
                    <li className="text-red-600">
                      Both AI services are failing. Check your API keys and
                      network connection.
                    </li>
                  )}
                {results.claude.status !== "success" && (
                  <li>
                    Check your Claude API key (CLAUDE_API_KEY) in .env and
                    .env.local
                  </li>
                )}
                {results.openai.status !== "success" && (
                  <li>
                    Check your OpenAI API key (OPENAI_API_KEY) in .env and
                    .env.local
                  </li>
                )}
                {(results.claude.status === "success" ||
                  results.openai.status === "success") && (
                    <li className="text-green-600">
                      At least one AI service is working! You should be able to
                      use the &quot;Organize AI&quot; button.
                    </li>
                  )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
