import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export async function GET() {
  const results = {
    claude: { status: "untested", message: "" },
    openai: { status: "untested", message: "" },
  };

  // Test Claude connection
  try {
    const anthropicApiKey =
      process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      results.claude = { status: "error", message: "No Claude API key found" };
    } else {
      const anthropic = new Anthropic({
        apiKey: anthropicApiKey,
      });

      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 100,
        messages: [{ role: "user", content: "Say hello" }],
      });

      
      if (response && response.content && response.content.length > 0) {
        results.claude = {
          status: "success",
          message: "Connection successful",
        };
      } else {
        results.claude = { status: "error", message: "No content in response" };
      }
    }
  } catch (error) {
    results.claude = {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unknown error with Claude API",
    };
  }

  // Test OpenAI connection
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      results.openai = { status: "error", message: "No OpenAI API key found" };
    } else {
      const openai = new OpenAI({
        apiKey: openaiApiKey,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say hello" }],
        max_tokens: 50,
      });

      if (response && response.choices && response.choices.length > 0) {
        results.openai = {
          status: "success",
          message: "Connection successful",
        };
      } else {
        results.openai = { status: "error", message: "No content in response" };
      }
    }
  } catch (error) {
    results.openai = {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unknown error with OpenAI API",
    };
  }

  return NextResponse.json(results);
}
