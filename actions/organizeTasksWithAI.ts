"use server";

import { client } from "@/lib/schematic";
import { currentUser } from "@clerk/nextjs/server";
import { Task } from "@/components/VideoTaskContext";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export interface OrganizedTask {
  id: string;
  content: string;
  type: string;
  order: number;
  reason: string;
  expandedSteps?: string[]; // New field for additional steps/context
  isParent?: boolean;
  parentId?: string;
  parentOrder?: number;
}

interface RawOrganizedTask {
  id?: string;
  content?: string;
  type?: string;
  order?: number;
  reason?: string;
  expandedSteps?: string[];
}

export async function organizeTasksWithAI(videoId: string, tasks: Task[]) {
  const user = await currentUser();

  if (!user?.id) {
    throw new Error("User not found");
  }

  if (tasks.length === 0) {
    return {
      error: "No tasks to organize",
    };
  }

  // Format tasks for the prompt - this is used by both AI services
  const taskList = tasks
    .map(
      (task) =>
        `- Task ID: ${task._id}
Type: ${task.type}
Content: ${task.content}
Completed: ${task.completed}`
    )
    .join("\n\n");

  try {
    console.log("🗂️ Organizing tasks for videoId:", videoId);
    console.log("🗂️ Tasks to organize:", tasks.length);

    // Check if Anthropic API key is available
    const anthropicApiKey =
      process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!anthropicApiKey) {
      console.log("⚠️ No Claude API key found in environment variables");
    } else {
      console.log(
        "✅ Claude API key found:",
        anthropicApiKey.substring(0, 8) + "..."
      );
    }

    if (anthropicApiKey && anthropicApiKey !== "your_anthropic_api_key_here") {
      // Use Claude if API key is available
      try {
        // Initialize Anthropic client for Claude
        const anthropic = new Anthropic({
          apiKey: anthropicApiKey,
        });

        console.log("🤖 Using Claude for task organization");

        const response = await anthropic.messages.create({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 8000,
          system: `You are a video production assistant that helps organize tasks in an optimal sequential order for creating YouTube videos. Your job is to:
          
1. Break down high-level tasks into MANY specific actionable items - be extremely granular
2. Add detailed context and instructions to each task, especially for scripts
3. Create a comprehensive step-by-step workflow with 10+ steps minimum for each major task type
4. Provide thorough explanations for WHY each step matters and HOW to execute it
5. For script tasks, provide detailed breakdowns including camera angles, lighting suggestions, dialogue notes, b-roll opportunities, etc.

BE EXTREMELY DETAILED. Each high-level task should be broken down into at least 5-10 specific steps with clear guidance.`,
          messages: [
            {
              role: "user",
              content: `I have the following tasks for my YouTube video project. Please:

1. ANALYZE each task and identify any that are vague or high-level
2. EXPAND those tasks into MANY specific, actionable items with detailed instructions (at least 5-10 steps per high-level task)
3. ORGANIZE everything into a comprehensive sequential checklist
4. For script tasks especially, break them down extensively with specific:
   - Scene-by-scene shooting instructions
   - Camera angles and movements
   - Lighting recommendations
   - Dialogue delivery notes
   - B-roll suggestions
   - Visual effects considerations
   - Transitions between segments
5. EXPLAIN in detail why each step should be completed at that stage and how to execute it properly

Please respond in this JSON format:
{
  "organizedTasks": [
    {
      "id": "task_id",
      "content": "The original task content",
      "type": "task type (script, title, thumbnail, etc.)",
      "order": 1,
      "reason": "Detailed explanation of why this task is at this position and its importance to the overall workflow",
      "expandedSteps": [
        "Detailed step 1 with specific instructions for execution",
        "Detailed step 2 with specific instructions for execution",
        ...at least 5-10 detailed steps per high-level task...
      ]
    },
    ...
  ]
}

Here are my tasks:

${taskList}`,
            },
          ],
        });

        // Extract content from response based on the response format
        const result = response.content.find(
          (block) => block.type === "text"
        )?.text;
        if (!result) {
          throw new Error("Empty response from Claude");
        }

        return processAIResponse(result, user.id);
      } catch (claudeError) {
        console.error("❌ Error using Claude:", claudeError);
        const errorMessage =
          claudeError instanceof Error
            ? claudeError.message
            : "Unknown Claude error";
        console.error("❌ Claude error details:", errorMessage);

        // Fall back to OpenAI if Claude fails
        return fallbackToOpenAI(
          taskList,
          user.id,
          `Claude error: ${errorMessage}`
        );
      }
    } else {
      console.log("🔄 Falling back to OpenAI (No Claude API key found)");
      return fallbackToOpenAI(taskList, user.id, "No valid Claude API key");
    }
  } catch (error) {
    console.error("❌ Error organizing tasks:", error);
    return {
      error: `Failed to organize tasks: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Function to fallback to OpenAI if Claude is not available
async function fallbackToOpenAI(
  taskList: string,
  userId: string,
  claudeErrorReason: string = ""
) {
  try {
    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return {
        error: `No AI service available. Please set up API keys for Claude or OpenAI. Claude issue: ${claudeErrorReason}`,
      };
    }

    console.log("🤖 Using OpenAI as fallback for task organization");
    console.log(
      "✅ OpenAI API key found:",
      openaiApiKey.substring(0, 8) + "..."
    );

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: [
        {
          role: "system",
          content:
            "You are a video production assistant that helps organize tasks in an optimal sequential order for creating YouTube videos. Your primary job is to break down high-level tasks into MANY specific actionable steps with detailed instructions. Be extremely granular - each high-level task should become at least 5-10 specific steps. For script tasks especially, provide detailed production guidance including camera angles, lighting, dialogue notes, and b-roll suggestions.",
        },
        {
          role: "user",
          content: `I have the following tasks for my YouTube video project. Please:

1. ANALYZE each task and identify any that are vague or high-level
2. EXPAND those tasks into MANY specific, actionable items with detailed instructions (at least 5-10 steps per high-level task)
3. ORGANIZE everything into a comprehensive sequential checklist
4. For script tasks especially, break them down extensively with specific:
   - Scene-by-scene shooting instructions
   - Camera angles and movements
   - Lighting recommendations
   - Dialogue delivery notes
   - B-roll suggestions
   - Visual effects considerations
   - Transitions between segments
5. EXPLAIN in detail why each step should be completed at that stage and how to execute it properly

Please respond in this JSON format:
{
  "organizedTasks": [
    {
      "id": "task_id",
      "content": "The original task content",
      "type": "task type (script, title, thumbnail, etc.)",
      "order": 1,
      "reason": "Detailed explanation of why this task is at this position and its importance to the overall workflow",
      "expandedSteps": [
        "Detailed step 1 with specific instructions for execution",
        "Detailed step 2 with specific instructions for execution",
        ...at least 5-10 detailed steps per high-level task...
      ]
    },
    ...
  ]
}

Here are my tasks:

${taskList}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000,
    });

    const result = response.choices[0]?.message.content;
    if (!result) {
      throw new Error("Empty response from OpenAI");
    }

    return processAIResponse(result, userId);
  } catch (openaiError) {
    console.error("❌ Error using OpenAI fallback:", openaiError);
    const errorMessage =
      openaiError instanceof Error
        ? openaiError.message
        : "Unknown OpenAI error";
    console.error("❌ OpenAI error details:", errorMessage);

    return {
      error: `Failed with both AI services: Connection error. Claude issue: ${claudeErrorReason}. OpenAI issue: ${errorMessage}`,
    };
  }
}

// Common function to process the AI response and track the event
async function processAIResponse(result: string, userId: string) {
  try {
    console.log("Processing AI response...");

    // Extract JSON from the response - handle multiple possible formats
    let jsonContent;
    try {
      // Try to extract JSON from code blocks first
      const jsonMatch =
        result.match(/```json\n([\s\S]*?)\n```/) ||
        result.match(/```\n([\s\S]*?)\n```/) ||
        result.match(/{[\s\S]*?}/) ||
        null;

      jsonContent = jsonMatch ? jsonMatch[1] || jsonMatch[0] : result;

      // Clean up any potential markdown or text before/after the JSON
      jsonContent = jsonContent.trim();

      // If it doesn't start with {, try to find the first {
      if (!jsonContent.startsWith("{")) {
        const startIndex = jsonContent.indexOf("{");
        if (startIndex >= 0) {
          jsonContent = jsonContent.substring(startIndex);
        }
      }

      console.log("Extracting JSON from response...");
    } catch (extractError) {
      console.error("Error extracting JSON:", extractError);
      jsonContent = result;
    }

    try {
      const parsedResult = JSON.parse(jsonContent);

      // Validate the structure
      if (
        !parsedResult.organizedTasks ||
        !Array.isArray(parsedResult.organizedTasks)
      ) {
        console.error("Invalid response format - missing organizedTasks array");
        return {
          error: "Invalid AI response format - missing tasks array",
          rawResponse: result,
        };
      }

      // Process the tasks to convert expanded steps into individual tasks
      const enhancedTasks: OrganizedTask[] = [];
      let taskOrder = 1;

      parsedResult.organizedTasks.forEach(
        (parentTask: RawOrganizedTask, index: number) => {
          // Add the parent task
          const taskId = parentTask.id || `task_${index}`;
          const parentTaskOrder = taskOrder++;

          enhancedTasks.push({
            id: taskId,
            content: parentTask.content || "Unnamed task",
            type: parentTask.type || "general",
            order: parentTaskOrder,
            reason:
              parentTask.reason ||
              "This task is an important part of the workflow",
            isParent: true,
            expandedSteps: [], // We'll process these into individual tasks
          });

          // Process expanded steps into individual tasks
          if (
            parentTask.expandedSteps &&
            Array.isArray(parentTask.expandedSteps) &&
            parentTask.expandedSteps.length > 0
          ) {
            parentTask.expandedSteps.forEach((step, stepIndex) => {
              enhancedTasks.push({
                id: `${taskId}_step_${stepIndex}`,
                content: step,
                type: parentTask.type || "general",
                order: taskOrder++,
                reason: `Sub-task for: ${parentTask.content || "parent task"}`,
                parentId: taskId,
                parentOrder: parentTaskOrder,
              });
            });
          }
        }
      );

      // Replace the original tasks with our enhanced version
      parsedResult.organizedTasks = enhancedTasks;

      // Track the event
      await client.track({
        event: "task_organization",
        company: {
          id: userId,
        },
        user: {
          id: userId,
        },
      });

      console.log(
        `🗂️ Successfully organized ${enhancedTasks.length} tasks with detailed breakdowns`
      );
      return parsedResult;
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      // Provide detailed error with a snippet of the content that failed to parse
      return {
        error: `Failed to parse AI response JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
        rawResponsePreview: jsonContent.substring(0, 200) + "...", // Show first 200 chars for debugging
      };
    }
  } catch (error) {
    console.error("Error in processAIResponse:", error);
    return {
      error: `Failed to process AI response: ${error instanceof Error ? error.message : "Unknown error"}`,
      rawResponse: result.substring(0, 500) + "...", // Show first 500 chars for debugging
    };
  }
}
