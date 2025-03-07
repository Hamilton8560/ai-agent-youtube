import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  videos: defineTable({
    videoId: v.string(),
    userId: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"]),

  transcript: defineTable({
    videoId: v.string(),
    userId: v.string(),
    transcript: v.array(
      v.object({
        text: v.string(),
        timestamp: v.string(),
      })
    ),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"]),

  images: defineTable({
    storageId: v.id("_storage"),
    userId: v.string(),
    videoId: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"]),

  titles: defineTable({
    videoId: v.string(),
    userId: v.string(),
    title: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"]),

  tasks: defineTable({
    videoId: v.string(),
    userId: v.string(),
    messageId: v.string(),
    content: v.string(),
    type: v.string(), // "script", "title", "thumbnail", "general"
    completed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"])
    .index("by_completed", ["completed"])
    .index("by_type", ["type"]),

  chats: defineTable({
    videoId: v.string(),
    userId: v.string(),
    messages: v.array(
      v.object({
        id: v.string(),
        role: v.string(), // "user" or "assistant"
        content: v.optional(v.string()),
        createdAt: v.number(),
        parts: v.optional(
          v.array(
            v.union(
              v.object({
                type: v.literal("text"),
                text: v.string(),
              }),
              v.object({
                type: v.literal("tool-invocation"),
                toolInvocation: v.object({
                  toolCallId: v.string(),
                  toolName: v.string(),
                  result: v.optional(v.any()),
                }),
              })
            )
          )
        ),
      })
    ),
    lastUpdated: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"]),

  organizedTasks: defineTable({
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
    createdAt: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"]),

  // A simpler table structure for organized tasks - one row per task
  organizedTaskItems: defineTable({
    videoId: v.string(),
    userId: v.string(),
    taskId: v.string(),
    content: v.string(),
    type: v.string(),
    order: v.number(),
    reason: v.string(),
    isParent: v.boolean(),
    parentId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_video_id", ["videoId"])
    .index("by_user_and_video", ["userId", "videoId"])
    .index("by_parent_id", ["parentId"]),
});
