import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a new task
export const createTask = mutation({
  args: {
    videoId: v.string(),
    userId: v.string(),
    messageId: v.string(),
    content: v.string(),
    type: v.string(), // "script", "title", "thumbnail", "general"
  },
  handler: async (ctx, args) => {
    console.log("Server received createTask request:", args);

    // Insert the task into the database with explicit timestamps
    const taskId = await ctx.db.insert("tasks", {
      videoId: args.videoId,
      userId: args.userId,
      messageId: args.messageId,
      content: args.content,
      type: args.type,
      completed: false,
      createdAt: Date.now(),
    });

    console.log("Task created with ID:", taskId);
    return taskId;
  },
});

// Get all tasks for a video
export const getTasksByVideo = query({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Getting tasks for video:", args);

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_and_video", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .order("desc")
      .collect();

    console.log(`Found ${tasks.length} tasks for video ${args.videoId}`);
    return tasks;
  },
});

// Get all tasks for a user
export const getTasksByUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Getting tasks for user:", args.userId);

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    console.log(`Found ${tasks.length} tasks for user ${args.userId}`);
    return tasks;
  },
});

// Update a task's completion status
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    console.log("Updating task status:", args);

    const result = await ctx.db.patch(args.taskId, {
      completed: args.completed,
    });

    console.log("Task status updated:", result);
    return result;
  },
});

// Delete a task
export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    console.log("Deleting task:", args.taskId);

    const result = await ctx.db.delete(args.taskId);
    console.log("Task deleted:", result);
    return result;
  },
});

// Save organized tasks
export const saveOrganizedTasks = mutation({
  args: {
    videoId: v.string(),
    userId: v.string(),
    tasks: v.array(
      v.object({
        id: v.string(),
        content: v.string(),
        type: v.string(),
        order: v.number(),
        reason: v.string(),
        expandedSteps: v.optional(v.array(v.string())),
        isParent: v.optional(v.boolean()),
        parentId: v.optional(v.string()),
        parentOrder: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    console.log("Saving organized tasks for video:", args.videoId);
    console.log(`Received ${args.tasks.length} organized tasks`);

    try {
      // Simplify the tasks for storage - this can help with size limitations
      const simplifiedTasks = args.tasks.map((task) => ({
        id: task.id,
        content: task.content,
        type: task.type,
        order: task.order,
        reason: task.reason,
        expandedSteps: task.expandedSteps || [],
        isParent: task.isParent || false,
        parentId: task.parentId || undefined,
        parentOrder: task.parentOrder || undefined,
      }));

      console.log(
        "Size of tasks JSON:",
        JSON.stringify(simplifiedTasks).length,
        "bytes"
      );

      // Check if there's already an entry for this video
      const existingEntry = await ctx.db
        .query("organizedTasks")
        .withIndex("by_user_and_video", (q) =>
          q.eq("userId", args.userId).eq("videoId", args.videoId)
        )
        .first();

      console.log(
        "Existing entry found:",
        existingEntry ? existingEntry._id : "none"
      );

      const now = Date.now();

      if (existingEntry) {
        // Update the existing entry
        console.log(
          "Updating existing organized tasks entry:",
          existingEntry._id
        );

        try {
          const result = await ctx.db.patch(existingEntry._id, {
            tasks: simplifiedTasks,
            lastUpdated: now,
          });
          console.log("Update result:", result);
          return result;
        } catch (updateError) {
          console.error("Error during update operation:", updateError);
          throw new Error(
            `Database update failed: ${updateError instanceof Error ? updateError.message : "Unknown error"}`
          );
        }
      } else {
        // Create a new entry
        console.log("Creating new organized tasks entry");

        try {
          // Try first without large expandedSteps arrays to reduce size
          const tasksWithoutExpandedSteps = simplifiedTasks.map((task) => ({
            ...task,
            expandedSteps: [], // Empty array instead of potentially large arrays
          }));

          console.log(
            "Inserting data with size:",
            JSON.stringify({
              videoId: args.videoId,
              userId: args.userId,
              tasks: tasksWithoutExpandedSteps,
              createdAt: now,
              lastUpdated: now,
            }).length,
            "bytes"
          );

          const result = await ctx.db.insert("organizedTasks", {
            videoId: args.videoId,
            userId: args.userId,
            tasks: tasksWithoutExpandedSteps, // Try without expanded steps first
            createdAt: now,
            lastUpdated: now,
          });

          console.log("Insert result:", result);
          return result;
        } catch (insertError) {
          console.error("Error during insert operation:", insertError);
          throw new Error(
            `Database insert failed: ${insertError instanceof Error ? insertError.message : "Unknown error"}`
          );
        }
      }
    } catch (error) {
      console.error("Error in saveOrganizedTasks:", error);
      throw error;
    }
  },
});

// Get organized tasks for a video
export const getOrganizedTasks = query({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Getting organized tasks for video:", args.videoId);

    const organizedTasks = await ctx.db
      .query("organizedTasks")
      .withIndex("by_user_and_video", (q) =>
        q.eq("userId", args.userId).eq("videoId", args.videoId)
      )
      .first();

    if (organizedTasks) {
      console.log(
        `Found organized tasks with ${organizedTasks.tasks.length} items`
      );
    } else {
      console.log("No organized tasks found for this video");
    }

    return organizedTasks;
  },
});

// Save organized tasks as individual items - simpler approach
export const saveOrganizedTaskItems = mutation({
  args: {
    videoId: v.string(),
    userId: v.string(),
    tasks: v.array(
      v.object({
        id: v.string(),
        content: v.string(),
        type: v.string(),
        order: v.number(),
        reason: v.string(),
        isParent: v.optional(v.boolean()),
        parentId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    console.log(
      `Saving ${args.tasks.length} organized task items for video:`,
      args.videoId
    );

    try {
      // First, delete any existing task items for this video/user
      const existingItems = await ctx.db
        .query("organizedTaskItems")
        .withIndex("by_user_and_video", (q) =>
          q.eq("userId", args.userId).eq("videoId", args.videoId)
        )
        .collect();

      console.log(
        `Found ${existingItems.length} existing task items to delete`
      );

      // Delete existing items if any exist
      for (const item of existingItems) {
        await ctx.db.delete(item._id);
      }

      // Store each task as a separate row
      const now = Date.now();
      const results = [];

      for (const task of args.tasks) {
        const result = await ctx.db.insert("organizedTaskItems", {
          videoId: args.videoId,
          userId: args.userId,
          taskId: task.id,
          content: task.content,
          type: task.type,
          order: task.order,
          reason: task.reason,
          isParent: !!task.isParent,
          parentId: task.parentId,
          createdAt: now,
        });
        results.push(result);
      }

      console.log(`Successfully saved ${results.length} task items`);
      return { success: true, count: results.length };
    } catch (error) {
      console.error("Error in saveOrganizedTaskItems:", error);
      throw error;
    }
  },
});

// Get organized task items for a video
export const getOrganizedTaskItems = query({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Getting organized task items for video:", args.videoId);

    try {
      const items = await ctx.db
        .query("organizedTaskItems")
        .withIndex("by_user_and_video", (q) =>
          q.eq("userId", args.userId).eq("videoId", args.videoId)
        )
        .collect();

      console.log(`Found ${items.length} organized task items`);

      // Sort items by order
      items.sort((a, b) => a.order - b.order);

      return items;
    } catch (error) {
      console.error("Error getting organized task items:", error);
      return [];
    }
  },
});
